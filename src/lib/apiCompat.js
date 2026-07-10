// Drop-in replacement for the old axios instance (src/utils/api.js).
//
// Goal: keep every existing call site working — `api.get('/api/...')`,
// `api.post(...)`, `api.fetchData(...)`, etc. — while routing each path to a
// Supabase query or an Edge Function instead of the deleted Express backend.
//
// Endpoints are migrated incrementally (per the phased plan). Register a
// handler for a METHOD + path-pattern here; unregistered paths throw a clear
// error so we can see exactly what still needs porting.
import { supabase } from './supabase';
import { rpc, invoke } from './realtime';

// --- route table -----------------------------------------------------------
// Each entry: [method, RegExp, async (params, body) => data]
// `params` are the capture groups from the path RegExp.
const routes = [];

export function register(method, pattern, handler) {
  routes.push([method.toUpperCase(), pattern, handler]);
}

function match(method, url) {
  const path = url.split('?')[0];
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const res = pattern.exec(path);
    if (res) return { handler, params: res.slice(1) };
  }
  return null;
}

async function dispatch(method, url, body) {
  const found = match(method, url);
  if (!found) {
    throw new Error(`[apiCompat] No Supabase mapping yet for ${method} ${url}`);
  }
  return found.handler(found.params, body, url);
}

// Axios-shaped helpers return `{ data }`; the *Data helpers return data directly,
// matching the old api.js contract exactly.
const api = {
  get: async (url) => ({ data: await dispatch('GET', url) }),
  post: async (url, body) => ({ data: await dispatch('POST', url, body) }),
  put: async (url, body) => ({ data: await dispatch('PUT', url, body) }),
  patch: async (url, body) => ({ data: await dispatch('PATCH', url, body) }),
  delete: async (url) => ({ data: await dispatch('DELETE', url) }),
  fetchData: (url) => dispatch('GET', url),
  postData: (url, body) => dispatch('POST', url, body),
  updateData: (url, body) => dispatch('PUT', url, body),
  deleteData: (url) => dispatch('DELETE', url),
};

// Re-export so old `import { serverUrl } from '../utils/api'` keeps resolving.
export const serverUrl = () => import.meta.env.VITE_SUPABASE_URL ?? '';

// Expose primitives for handlers that want them.
export { supabase, rpc, invoke };
export default api;
