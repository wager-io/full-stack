// Supabase clients for Edge Functions, and the caller-identification helper
// every user-facing function needs.
//
// Two clients, deliberately kept apart:
//   - `service` bypasses RLS and can call the revoked money RPCs. Never hand it
//     a user-supplied id without having established that id yourself.
//   - `asUser()` carries the caller's own JWT, so RLS applies. Used only to ask
//     "who is this?" — the answer comes from Supabase verifying the token, not
//     from anything in the request body.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

export const service: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function asUser(authHeader: string): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface Caller {
  id: string;
  email: string | null;
  isAdmin: boolean;
}

/**
 * Resolve the caller from their Authorization header.
 *
 * Returns null for anything that does not verify. The admin flag is read from
 * `profiles` with the SERVICE client on purpose: a JWT claim could be stale
 * after a demotion, and the row is the only current answer.
 */
export async function identify(req: Request): Promise<Caller | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const { data, error } = await asUser(authHeader).auth.getUser();
  if (error || !data?.user) return null;

  const { data: profile } = await service
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isAdmin: Boolean(profile?.is_admin),
  };
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * A refusal the caller needs to READ, returned with HTTP 200.
 *
 * Not sloppiness. These functions are called through supabase-js
 * `functions.invoke`, which collapses every non-2xx response into a generic
 * FunctionsHttpError and discards the body — so a 409 carrying "this
 * withdrawal is already BROADCASTING" arrives at the UI as "Edge Function
 * returned a non-2xx status code" and nothing more. Putting the outcome in the
 * payload is what lets it survive the round trip.
 *
 * Reserve real status codes for requests that should never have been made —
 * unauthenticated, not an admin, malformed body. Those are not outcomes to
 * report back to a user.
 */
export function refuse(message: string, extra: Record<string, unknown> = {}): Response {
  return json({ success: false, message, ...extra });
}
