// Money-path smoke test for 0015, against the LIVE project.
//
// 07_ccpayment.sql is the same test in SQL and needs psql. Where that is not
// available this drives the same RPCs over the real API with a throwaway
// account — the pattern security-check.mjs already uses, including its
// wager-test-* cleanup. Run: node scripts/ccp-smoke.mjs
//
// The questions worth asking are not "does a deposit credit" but "does the
// SECOND copy of that deposit credit as well", and the same for a refund.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^['"]|['"]$/g, '')] }),
)

const SB_URL = env.VITE_SUPABASE_URL
const admin = createClient(SB_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

let pass = 0, fail = 0
const tap = (label, ok) => { ok ? pass++ : fail++; console.log(`  ${ok ? 'PASS  ' : 'FAIL <<'} ${label}`) }
const bal = async (id) =>
  Number((await admin.from('profiles').select('balance').eq('id', id).single()).data.balance)

const stamp = Date.now().toString(36)
const EMAIL = `wager-test-ccp-${stamp}@example.com`
const PW = 'Str0ng!Passw0rd#2026'
const REF = `user_ccptest_${stamp}_chain_ETH`

// --- clean slate ----------------------------------------------------------
{
  const { data } = await admin.auth.admin.listUsers()
  for (const u of data.users.filter((u) => u.email?.startsWith('wager-test-ccp-'))) {
    await admin.auth.admin.deleteUser(u.id)
  }
}

const { data: created, error: eCreate } = await admin.auth.admin.createUser({
  email: EMAIL, password: PW, email_confirm: true,
  user_metadata: { username: `ccptest${stamp}` },
})
if (eCreate) { console.error('signup failed:', eCreate); process.exit(1) }
const uid = created.user.id

await admin.rpc('adjust_balance', { p_user: uid, p_delta: 1000 })

console.log('\n  --- deposits (0015) ---')

{
  const { error } = await admin.rpc('ccp_bind_address', {
    p_user: uid, p_chain: 'ETH', p_address: '0xdeadbeef', p_reference_id: REF, p_memo: null,
  })
  tap('ccp_bind_address records the permanent address', !error)
}

const dep = (recordId, status, risky, amount = 0.5, price = 2000, ref = REF) =>
  admin.rpc('ccp_credit_deposit', {
    p_record_id: recordId, p_reference_id: ref, p_coin: 'ETH',
    p_amount: amount, p_coin_usd_price: price, p_status: status, p_is_risky: risky, p_raw: {},
  })

const recId = `smoke_${stamp}`

// Still confirming: recorded so the player sees it pending, but nothing paid.
{
  const before = await bal(uid)
  const { data } = await dep(recId, 'Processing', false)
  tap('a Processing deposit is recorded, not credited', data?.action === 'recorded')
  tap('  ...and the balance did not move', (await bal(uid)) === before)
}

// Confirmed: credits the USD VALUE. 0.5 ETH at 2000 is 1000.00, not 0.5 —
// crediting the face number is what the original did.
{
  const before = await bal(uid)
  const { data } = await dep(recId, 'Success', false)
  tap('a confirmed deposit credits', data?.action === 'credited')
  tap('  ...the USD value, not the coin amount (0.5 ETH @2000 = 1000)', (await bal(uid)) - before === 1000)
}

// CRUX: the retry. CCPayment redelivers until it gets a 200, and may redeliver after one.
{
  const before = await bal(uid)
  const { data } = await dep(recId, 'Success', false)
  tap('CRUX: a replayed deposit does NOT credit again', data?.action === 'already_credited')
  tap('  ...balance unchanged on the replay', (await bal(uid)) === before)
  const { count } = await admin.from('bills').select('*', { count: 'exact', head: true })
    .eq('bill_id', `ccp_dep_${recId}`)
  tap('  ...exactly one ledger row for one deposit', count === 1)
}

// A flagged deposit is held for a human, not paid.
{
  const before = await bal(uid)
  const { data } = await dep(`${recId}_risky`, 'Success', true, 1)
  tap('a risky deposit is held, not credited', data?.action === 'recorded')
  tap('  ...and the balance did not move', (await bal(uid)) === before)
}

// NaN, the 0012 lesson, arriving through a webhook instead of a stake.
{
  const { error } = await dep(`${recId}_nan`, 'Success', false, 'NaN')
  tap('a NaN deposit amount is REFUSED', !!error && error.message.includes('invalid_amount'))
  const b = await bal(uid)
  tap('  ...and the balance is still a number', Number.isFinite(b))
}

// Money for an address nobody owns: answered, not raised, so the function can
// return 200 and stop a retry that can never succeed.
{
  const { data } = await dep(`${recId}_orphan`, 'Success', false, 1, 2000, 'user_nobody_chain_ETH')
  tap('a deposit for an unowned address reports unknown_reference', data?.action === 'unknown_reference')
}

console.log('\n  --- withdrawals (0015) ---')

const browser = createClient(SB_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { error: eLogin } = await browser.auth.signInWithPassword({ email: EMAIL, password: PW })
if (eLogin) { console.error('login failed:', eLogin); process.exit(1) }

let orderId = null
{
  const before = await bal(uid)
  const { data, error } = await browser.rpc('ccp_withdrawal_request', {
    p_amount: 100, p_coin: 'USDT', p_chain: 'ETH', p_address: '0xabc', p_memo: null,
  })
  orderId = data?.order_id
  tap('a player can request a withdrawal', !error && !!orderId)
  // The amount leaves on request: money already on its way out must not also
  // be spendable.
  tap('  ...and the balance is debited immediately', before - (await bal(uid)) === 100)
}

{
  const before = await bal(uid)
  await admin.rpc('ccp_settle_withdrawal', { p_order_id: orderId, p_cc_status: 'Processing', p_raw: {} })
  tap('Processing does not move the balance', (await bal(uid)) === before)
}

// CRUX: the branch that never ran in the original.
{
  const before = await bal(uid)
  const { data } = await admin.rpc('ccp_settle_withdrawal', { p_order_id: orderId, p_cc_status: 'Failed', p_raw: {} })
  tap('CRUX: a failed withdrawal refunds the player', data?.action === 'refunded')
  tap('  ...the full amount (100)', (await bal(uid)) - before === 100)
}

// CRUX: and only once, however many times the failure is delivered.
{
  const before = await bal(uid)
  const { data } = await admin.rpc('ccp_settle_withdrawal', { p_order_id: orderId, p_cc_status: 'Failed', p_raw: {} })
  tap('CRUX: a replayed failure does NOT refund twice', data?.action !== 'refunded')
  await admin.rpc('ccp_settle_withdrawal', { p_order_id: orderId, p_cc_status: 'Rejected', p_raw: {} })
  tap('  ...nor does a Rejected after a Failed', (await bal(uid)) === before)
  const { count } = await admin.from('bills').select('*', { count: 'exact', head: true })
    .eq('bill_id', `ccp_wdr_refund_${orderId}`)
  tap('  ...exactly one refund ledger row', count === 1)
}

// A withdrawal that succeeds is never refunded.
{
  const { data: w } = await browser.rpc('ccp_withdrawal_request', {
    p_amount: 50, p_coin: 'USDT', p_chain: 'ETH', p_address: '0xabc', p_memo: null,
  })
  const before = await bal(uid)
  await admin.rpc('ccp_settle_withdrawal', { p_order_id: w.order_id, p_cc_status: 'Success', p_raw: {} })
  await admin.rpc('ccp_settle_withdrawal', { p_order_id: w.order_id, p_cc_status: 'Success', p_raw: {} })
  tap('a completed withdrawal is never refunded', (await bal(uid)) === before)
}

{
  const { count: before } = await admin.from('ccp_withdrawals').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  const { error } = await browser.rpc('ccp_withdrawal_request', {
    p_amount: 999999, p_coin: 'USDT', p_chain: 'ETH', p_address: '0xabc', p_memo: null,
  })
  tap('ATTACK withdrawing beyond the balance is DENIED', !!error && error.message.includes('insufficient_balance'))
  const { count: after } = await admin.from('ccp_withdrawals').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  tap('  ...and leaves no row behind to reconcile', before === after)
}

{
  const { error } = await browser.rpc('ccp_withdrawal_request', {
    p_amount: 0.005, p_coin: 'USDT', p_chain: 'ETH', p_address: '0xabc', p_memo: null,
  })
  tap('ATTACK a sub-cent withdrawal is DENIED', !!error && error.message.includes('invalid_amount_precision'))
}

console.log('\n  --- the client cannot move this money itself ---')

{
  const { error } = await browser.rpc('ccp_credit_deposit', {
    p_record_id: 'forged', p_reference_id: REF, p_coin: 'ETH',
    p_amount: 1, p_coin_usd_price: 999999, p_status: 'Success', p_is_risky: false, p_raw: {},
  })
  tap('ATTACK calling ccp_credit_deposit as a player is DENIED', !!error)
}
{
  const { error } = await browser.rpc('ccp_settle_withdrawal', { p_order_id: orderId, p_cc_status: 'Failed', p_raw: {} })
  tap('ATTACK calling ccp_settle_withdrawal as a player is DENIED', !!error)
}
{
  const { error } = await browser.from('ccp_deposits').insert({
    record_id: 'forged2', user_id: uid, coin: 'ETH', amount: 1, status: 'Success',
  })
  tap('ATTACK inserting a deposit row directly is DENIED', !!error)
}
// RLS with actual rows in the table — the check that was not provable while it was empty.
{
  const other = createClient(SB_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  const { data } = await other.from('ccp_deposits').select('id')
  tap('RLS: an anonymous caller reads no deposits (table now has rows)', (data || []).length === 0)
  const { data: mine } = await browser.from('ccp_deposits').select('id')
  tap('RLS: the owner CAN read their own deposits', (mine || []).length > 0)
}

// --- clean up -------------------------------------------------------------
await admin.auth.admin.deleteUser(uid)
{
  const { count } = await admin.from('ccp_deposits').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  tap('cleanup: deleting the account cascades its CCPayment rows', count === 0)
}

console.log(`\n  ${pass}/${pass + fail} passed\n`)
process.exit(fail === 0 ? 0 : 1)
