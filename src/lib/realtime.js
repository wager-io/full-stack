// Thin helpers that mirror the old socket.io ergonomics so the per-game React
// contexts can swap their internals with minimal change.
//
//   socket.emit(evt, payload, cb)   ->  const res = await rpc('place_dice_bet', payload)
//   socket.on(evt, handler)         ->  const off = subscribeTable('dice_history', {...})
//
// `rpc`/`invoke` return the SAME shape the old socket callbacks used:
//   success: { code: 0, data }
//   error:   { code: -1, message }
// so call sites that check `res.code === 0` keep working unchanged.
import { supabase } from './supabase';

export async function rpc(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { code: -1, message: error.message, error };
  // A function may itself return an object already shaped { code, ... }.
  if (data && typeof data === 'object' && !Array.isArray(data) && 'code' in data) return data;
  return { code: 0, data };
}

export async function invoke(name, body = {}) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) return { code: -1, message: error.message, error };
  if (data && typeof data === 'object' && !Array.isArray(data) && 'code' in data) return data;
  return { code: 0, data };
}

let channelSeq = 0;

// Subscribe to Postgres row changes on a table.
// Returns an unsubscribe fn that drops straight into a useEffect cleanup.
export function subscribeTable(
  table,
  { schema = 'public', event = '*', filter, onInsert, onUpdate, onDelete, onChange } = {}
) {
  const channel = supabase.channel(`tbl:${table}:${channelSeq++}`);
  channel.on(
    'postgres_changes',
    { event, schema, table, ...(filter ? { filter } : {}) },
    (payload) => {
      onChange?.(payload);
      if (payload.eventType === 'INSERT') onInsert?.(payload.new, payload);
      else if (payload.eventType === 'UPDATE') onUpdate?.(payload.new, payload);
      else if (payload.eventType === 'DELETE') onDelete?.(payload.old, payload);
    }
  );
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

// Ephemeral pub/sub (live bet feed, chat typing, presence-style events) where a
// DB write would be overkill. Returns an unsubscribe fn.
export function subscribeBroadcast(channelName, event, cb) {
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  channel.on('broadcast', { event }, (payload) => cb(payload.payload));
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

// Fire a broadcast message. Resolves once sent.
export async function broadcast(channelName, event, payload) {
  const channel = supabase.channel(channelName);
  await channel.subscribe();
  await channel.send({ type: 'broadcast', event, payload });
  return () => supabase.removeChannel(channel);
}
