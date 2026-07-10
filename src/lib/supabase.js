// Single shared Supabase client for the whole app (frontend + admin).
// Replaces the old axios base (src/utils/api.js) and socket.io client
// (src/services/socketService.js) as the single transport to the backend.
//
// The browser only ever uses the ANON key: it can authenticate, read
// RLS-protected data, and open Realtime subscriptions. Every money mutation
// goes through a SECURITY DEFINER RPC or a service-role Edge Function.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw — let the app boot so the UI still renders during local setup.
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill them in.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'wager-auth',
  },
});

export default supabase;
