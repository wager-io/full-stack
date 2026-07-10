// Supabase-backed auth service. Same exported function names and return shapes
// as before ({ user, token } etc.) so LoginForm/RegisterForm/ForgotPassword are
// untouched — only the transport underneath changed from the Express API to
// Supabase Auth.
import { supabase } from '../lib/supabase';

// Throw in the shape the old axios callers expect: err.response.data.message
const authError = (message) => ({ response: { data: { message } }, message });

export async function getProfile(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

// Merge a Supabase auth user + its profiles row into the legacy `user` shape the
// rest of the app consumes. `_id` is the alias the games read.
export function mapUser(authUser, profile) {
  if (!authUser) return null;
  const p = profile || {};
  return {
    ...p,
    id: authUser.id,
    _id: authUser.id,
    email: authUser.email ?? p.email,
    username: p.username,
    balance: p.balance ?? 0,
    is_admin: !!p.is_admin,
    is_verified: !!authUser.email_confirmed_at || !!p.is_verified,
  };
}

// User login
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw authError(error.message);
  const profile = await getProfile(data.user.id).catch(() => null);
  return { user: mapUser(data.user, profile), token: data.session?.access_token };
};

// User registration. The profile row is created automatically by the
// on_auth_user_created trigger; we pass username/profile fields via user metadata.
export const register = async (form) => {
  const { email, password, username, ...rest } = form;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, ...rest } },
  });
  if (error) throw authError(error.message);
  const profile = data.user ? await getProfile(data.user.id).catch(() => null) : null;
  return { user: mapUser(data.user, profile), token: data.session?.access_token };
};

// Fetch user profile (AuthContext reads response.user)
export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw authError('Not authenticated');
  const profile = await getProfile(user.id);
  return { user: mapUser(user, profile) };
};

// Password reset — Supabase emails a recovery code/link.
export const sendForgotPasswordOTP = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw authError(error.message);
  return { success: true };
};

export const verifyOTP = async (email, otp) => {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' });
  if (error) throw authError(error.message);
  return { success: true, token: data.session?.access_token };
};

export const resetPassword = async (email, newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw authError(error.message);
  return { success: true };
};
