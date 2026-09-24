// Send-side smoke test: ccpayment-address and ccpayment-withdraw.
//
//   node scripts/ccp-send-smoke.mjs
//
// DELIBERATELY NEVER SENDS FUNDS. The test account is created with a ZERO
// balance, so the withdrawal path is exercised through auth, validation, the
// coin check and the debit — and stops at insufficient_balance, which is the
// last step before anything would leave. A test that actually moved coins
// would cost real money every time it ran.
//
// Deposit addresses are safe to ask for: CCPayment issues one per referenceId
// and returns the same string forever, so this binds the throwaway account an
// address and then deletes the account.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^['"]|['"]$/g, '')] }),
)

const SB_URL = env.VITE_SUPABASE_URL
const FN = `${SB_URL}/functions/v1`
const admin = createClient(SB_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

let pass = 0, fail = 0
const tap = (label, ok, extra = '') => {
  ok ? pass++ : fail++
  console.log(`  ${ok ? 'PASS  ' : 'FAIL <<'} ${label}${extra ? '  ' + extra : ''}`)
}

const stamp = Date.now().toString(36)
const EMAIL = `wager-test-send-${stamp}@example.com`
const PW = 'Str0ng!Passw0rd#2026'

{
  const { data } = await admin.auth.admin.listUsers()
  for (const u of data.users.filter((u) => u.email?.startsWith('wager-test-send-'))) {
    await admin.auth.admin.deleteUser(u.id)
  }
}

const { data: created, error: eCreate } = await admin.auth.admin.createUser({
  email: EMAIL, password: PW, email_confirm: true,
  user_metadata: { username: `sendtest${stamp}` },
})
if (eCreate) { console.error('signup failed:', eCreate); process.exit(1) }
const uid = created.user.id

const browser = createClient(SB_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { data: sess, error: eLogin } = await browser.auth.signInWithPassword({ email: EMAIL, password: PW })
if (eLogin) { console.error('login failed:', eLogin); process.exit(1) }
const JWT = sess.session.access_token

const call = async (fn, body, token) => {
  const res = await fetch(`${FN}/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.VITE_SUPABASE_ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  let json = null
  try { json = JSON.parse(await res.text()) } catch { /* non-JSON */ }
  return { status: res.status, json }
}

console.log('\n  --- ccpayment-address ---')

{
  const r = await call('ccpayment-address', { chain: 'ETH' }, null)
  tap('an unauthenticated caller is REFUSED', r.status === 401, `(${r.status})`)
}
{
  const r = await call('ccpayment-address', { chain: 'NOTACHAIN' }, JWT)
  tap('an unsupported chain is REFUSED', r.status === 400 && r.json?.error === 'unsupported_chain', `(${r.status})`)
}

let addressWorked = false
{
  const r = await call('ccpayment-address', { chain: 'ETH' }, JWT)
  if (r.status === 200 && r.json?.address) {
    addressWorked = true
    tap('a signed-in player gets a deposit address', true, r.json.address)
    // The binding is what makes an incoming deposit attributable at all.
    const { data } = await admin.from('ccp_deposit_addresses')
      .select('address, reference_id').eq('user_id', uid).eq('chain', 'ETH').maybeSingle()
    tap('  ...and it is bound in ccp_deposit_addresses', data?.address === r.json.address)
    tap('  ...under the referenceId the webhook looks up',
      data?.reference_id === `user_${uid}_chain_ETH`, data?.reference_id)
    // Second call must not cost a round trip or change the answer.
    const again = await call('ccpayment-address', { chain: 'ETH' }, JWT)
    tap('  ...and asking again returns the same address', again.json?.address === r.json.address)
  } else {
    const detail = r.json?.detail ?? JSON.stringify(r.json)
    const whitelisted = !String(detail).includes('224076')
    tap('a signed-in player gets a deposit address', false, `(${r.status}) ${String(detail).slice(0, 110)}`)
    if (!whitelisted) {
      console.log('\n  ^ error 224076: this function\'s egress IP is not whitelisted at CCPayment.')
      console.log('    Tick Developer Test Mode in the console, or set CCPAYMENT_PROXY_URL.\n')
    }
  }
}

console.log('\n  --- ccpayment-withdraw (zero balance: nothing can leave) ---')

{
  const r = await call('ccpayment-withdraw', { amount: 10, coinId: 1280, chain: 'ETH', address: '0xabc' }, null)
  tap('an unauthenticated caller is REFUSED', r.status === 401, `(${r.status})`)
}
{
  const r = await call('ccpayment-withdraw', { amount: -5, coinId: 1280, chain: 'ETH', address: '0xabc' }, JWT)
  tap('a negative amount is REFUSED', r.status === 400 && r.json?.error === 'invalid_amount', `(${r.status})`)
}
{
  const r = await call('ccpayment-withdraw', { amount: 'NaN', coinId: 1280, chain: 'ETH', address: '0xabc' }, JWT)
  tap('a NaN amount is REFUSED', r.status === 400 && r.json?.error === 'invalid_amount', `(${r.status})`)
}
{
  const r = await call('ccpayment-withdraw', { amount: 0.005, coinId: 1280, chain: 'ETH', address: '0xabc' }, JWT)
  tap('a sub-cent amount is REFUSED', r.status === 400 && r.json?.error === 'invalid_amount_precision', `(${r.status})`)
}
{
  const r = await call('ccpayment-withdraw', { amount: 10, coinId: 1280, chain: 'ETH', address: '' }, JWT)
  tap('an empty address is REFUSED', r.status === 400 && r.json?.error === 'invalid_address', `(${r.status})`)
}

// The last line before funds would move. A zero balance means the debit fails,
// which proves auth, the coin check and the RPC were all reached.
{
  const before = Number((await admin.from('profiles').select('balance').eq('id', uid).single()).data.balance)
  const r = await call('ccpayment-withdraw', { amount: 10, coinId: 1280, chain: 'ETH', address: '0xabc' }, JWT)
  const after = Number((await admin.from('profiles').select('balance').eq('id', uid).single()).data.balance)

  if (r.json?.error === 'insufficient_balance') {
    tap('reaches the debit and stops at insufficient_balance', true)
  } else if (r.json?.error === 'unsupported_coin') {
    tap('a non-USDT coin is REFUSED (balance is USDT)', true, r.json.detail?.slice(0, 70))
  } else if (r.json?.error === 'coin_list_unavailable' || r.json?.error === 'unknown_coin') {
    const d = String(r.json?.detail ?? r.json?.error)
    tap('the coin check ran', false, d.includes('224076') ? 'egress IP not whitelisted (224076)' : d.slice(0, 90))
  } else {
    tap('reaches the debit and stops at insufficient_balance', false, `(${r.status}) ${JSON.stringify(r.json).slice(0, 110)}`)
  }
  tap('  ...and nothing was debited', before === after, `${before} -> ${after}`)
  const { count } = await admin.from('ccp_withdrawals').select('*', { count: 'exact', head: true }).eq('user_id', uid)
  tap('  ...and no withdrawal row was left behind', count === 0)
}

await admin.auth.admin.deleteUser(uid)
console.log(`\n  ${pass}/${pass + fail} passed${addressWorked ? '' : '   (address path blocked — see above)'}\n`)
process.exit(fail === 0 ? 0 : 1)
