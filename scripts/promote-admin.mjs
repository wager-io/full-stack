#!/usr/bin/env node
/**
 * Promote an existing user to admin.
 *
 *   npm run promote-admin -- you@example.com [super_admin|admin|moderator|support]
 *
 * There is deliberately no promote-to-admin endpoint reachable from the browser.
 * `promote_to_admin()` is granted to service_role only, so possession of the
 * service key IS the authorisation. Never expose that key to a client: note it
 * is read WITHOUT a VITE_ prefix, because Vite inlines VITE_* vars into the
 * bundle it ships to every visitor.
 *
 * The user must have signed up first — this promotes a profile, it does not
 * create one.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Minimal .env reader — avoids adding dotenv just for one script. */
function envFile(name) {
  try {
    return Object.fromEntries(
      readFileSync(resolve(root, name), 'utf8')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && l.includes('='))
        .map((l) => {
          const i = l.indexOf('=')
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
        }),
    )
  } catch {
    return {}
  }
}

const env = { ...envFile('.env'), ...process.env }

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

const [email, role = 'super_admin'] = process.argv.slice(2)

function die(msg) {
  console.error(`\n  ✗ ${msg}\n`)
  process.exit(1)
}

if (!email) die('Usage: npm run promote-admin -- you@example.com [role]')
if (!url) die('SUPABASE_URL (or VITE_SUPABASE_URL) is not set in .env')
if (!serviceKey) {
  die(
    'SUPABASE_SERVICE_ROLE_KEY is not set in .env\n' +
      "    Local:  the `service_role key` printed by `supabase start`\n" +
      '    Hosted: Project Settings → API → service_role secret',
  )
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data, error } = await supabase.rpc('promote_to_admin', {
  p_email: email,
  p_role: role,
})

if (error) die(`${error.message}`)

console.log(`\n  ✓ ${data.email} is now ${data.admin_role}\n    /admin is reachable for this account.\n`)
