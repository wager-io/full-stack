// End-to-end attack against the LIVE Supabase project, over the real REST API
// with a real user JWT — exactly what a malicious player's browser can do.
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

const stamp = process.argv[2] || 'x'
const mk = (n) => `wager-test-${n}-${stamp}@example.com`
const PW = 'Str0ng!Passw0rd#2026'

// --- clean slate ---------------------------------------------------------
const { data: existing } = await admin.auth.admin.listUsers()
for (const u of existing.users.filter((u) => u.email?.startsWith('wager-test-'))) {
  await admin.auth.admin.deleteUser(u.id)
}

// --- signup (the real Auth flow) -----------------------------------------
const { data: victimU, error: e1 } = await admin.auth.admin.createUser({
  email: mk('victim'), password: PW, email_confirm: true,
  user_metadata: { username: 'victim_' + stamp },
})
const { data: attackerU, error: e2 } = await admin.auth.admin.createUser({
  email: mk('attacker'), password: PW, email_confirm: true,
  user_metadata: { username: 'attacker_' + stamp },
})
if (e1 || e2) { console.error('signup failed:', e1 || e2); process.exit(1) }

const victimId = victimU.user.id, attackerId = attackerU.user.id

// The signup trigger should have created both rows.
const { data: prof } = await admin.from('profiles').select('id,username,balance,is_admin').in('id', [victimId, attackerId])
const { data: vip } = await admin.from('vip_progress').select('user_id').in('user_id', [victimId, attackerId])
tap('signup trigger created both profiles', prof?.length === 2)
tap('signup trigger created both vip_progress rows (0002 fix)', vip?.length === 2)
tap('new balances are zero', prof?.every((p) => Number(p.balance) === 0))
tap('nobody is admin by default', prof?.every((p) => !p.is_admin))

// Fund the victim through the privileged path.
await admin.rpc('adjust_balance', { p_user: victimId, p_delta: 500 })
const { data: v0 } = await admin.from('profiles').select('balance').eq('id', victimId).single()
tap('service_role can credit (legit path works)', Number(v0.balance) === 500)

// --- now become the attacker, in a real browser session -------------------
const browser = createClient(SB_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
const { data: session, error: e3 } = await browser.auth.signInWithPassword({ email: mk('attacker'), password: PW })
if (e3) { console.error('login failed:', e3); process.exit(1) }
tap('attacker can log in normally', session.user.id === attackerId)

console.log('\n  --- attacks over the real REST API, as a logged-in player ---')

// ATTACK 1: mint money via the RPC (the Day 1 hole)
{
  const { error } = await browser.rpc('adjust_balance', { p_user: attackerId, p_delta: 1_000_000 })
  tap('ATTACK mint via adjust_balance RPC is DENIED', !!error)
}
// ATTACK 2: drain the victim
{
  const { error } = await browser.rpc('adjust_balance', { p_user: victimId, p_delta: -500 })
  tap('ATTACK drain another user via RPC is DENIED', !!error)
}
// ATTACK 3: write balance directly
{
  await browser.from('profiles').update({ balance: 999999 }).eq('id', attackerId)
  const { data } = await admin.from('profiles').select('balance').eq('id', attackerId).single()
  tap('ATTACK direct balance write is BLOCKED', Number(data.balance) === 0)
}
// ATTACK 4: self-promote to admin (the Day 2 hole)
{
  await browser.from('profiles').update({ is_admin: true, admin_role: 'super_admin' }).eq('id', attackerId)
  const { data } = await admin.from('profiles').select('is_admin,admin_role').eq('id', attackerId).single()
  tap('ATTACK self-promote to super_admin is BLOCKED', data.is_admin === false)
}
// ATTACK 5: call the promotion RPC
{
  const { error } = await browser.rpc('promote_to_admin', { p_email: mk('attacker'), p_role: 'super_admin' })
  tap('ATTACK promote_to_admin RPC is DENIED', !!error)
}
// ATTACK 6/7: read other people's data
{
  const { data } = await browser.from('profiles').select('id,email,balance')
  const sawVictim = (data || []).some((r) => r.id === victimId)
  tap('RLS: cannot read another user\'s profile', !sawVictim)
  tap('RLS: CAN read own profile', (data || []).some((r) => r.id === attackerId))
}
{
  await admin.from('bills').insert({ user_id: victimId, transaction_type: 'deposit', trx_amount: 500 })
  const { data } = await browser.from('bills').select('id,user_id')
  tap('RLS: cannot read another user\'s bills', !(data || []).some((r) => r.user_id === victimId))
}
// ATTACK 8: impersonate in chat
{
  const { error } = await browser.from('chat').insert({ user_id: victimId, username: 'victim', content: 'hi' })
  tap('ATTACK chat post as another user is DENIED', !!error)
}
// ATTACK 9: escalate withdrawal / commission fields
{
  await browser.from('profiles').update({ withdrawal_disabled: false, commission_rate: 100 }).eq('id', attackerId)
  const { data } = await admin.from('profiles').select('commission_rate').eq('id', attackerId).single()
  tap('ATTACK raising own commission_rate is BLOCKED', Number(data.commission_rate) === 25)
}
// Legit action still works
{
  const { error } = await browser.from('profiles').update({ username: 'renamed_ok' }).eq('id', attackerId)
  const { data } = await admin.from('profiles').select('username').eq('id', attackerId).single()
  tap('player CAN still edit own username', !error && data.username === 'renamed_ok')
}
// hidden_from_public respected on the public view
{
  await admin.from('profiles').update({ hidden_from_public: true }).eq('id', victimId)
  const anonC = createClient(SB_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  const { data } = await anonC.from('public_profiles').select('id').eq('id', victimId)
  tap('public_profiles hides opted-out users', (data || []).length === 0)
}
// Final state
{
  const { data } = await admin.from('profiles').select('id,balance,is_admin').in('id', [victimId, attackerId])
  const vic = data.find((r) => r.id === victimId), att = data.find((r) => r.id === attackerId)
  tap('victim balance intact after all attacks (500)', Number(vic.balance) === 500)
  tap('attacker balance still 0', Number(att.balance) === 0)
  tap('attacker still not admin', att.is_admin === false)
}
// promote_to_admin works server-side (so /admin is reachable)
{
  const { error } = await admin.rpc('promote_to_admin', { p_email: mk('victim'), p_role: 'super_admin' })
  const { data } = await admin.from('profiles').select('is_admin,admin_role').eq('id', victimId).single()
  tap('service-side promote_to_admin works (/admin reachable)', !error && data.is_admin === true)
}

// cleanup
for (const id of [victimId, attackerId]) await admin.auth.admin.deleteUser(id)

console.log(`\n  ${pass}/${pass + fail} passed`)
process.exit(fail ? 1 : 0)
