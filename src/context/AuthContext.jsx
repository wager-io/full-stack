import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile } from '../services/authService';
import { getUserVipProgress } from '../services/vipService';
import { supabase } from '../lib/supabase';
import { subscribeTable } from '../lib/realtime';
import { toast } from 'sonner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial session check
  const [newScreen, setNewScreen] = useState(window.innerWidth);
  const [balance, setBalance] = useState(0);
  const [vipProgress, setVipProgress] = useState(null);
  const [vipTiers, setVipTiers] = useState([]);
  const [userVipTier, setUserVipTier] = useState(null);

  // Default VIP benefits
  const [vipBenefits] = useState([
    {
      title: "Instant Withdrawals",
      description: "Enjoy priority processing for all your withdrawal requests.",
      icon: "/assets/affiliate-icons/b1.webp"
    },
    {
      title: "Exclusive Promotions",
      description: "Access to special promotions and bonuses only available to VIP members.",
      icon: "/assets/affiliate-icons/b2.webp"
    },
    {
      title: "Dedicated VIP Host",
      description: "Personal account manager to assist with all your gaming needs.",
      icon: "/assets/affiliate-icons/b3.webp"
    },
    {
      title: "Customized Bonuses",
      description: "Receive personalized bonuses tailored to your gaming preferences.",
      icon: "/assets/affiliate-icons/b4.webp"
    }
  ]);

  // Default supported languages
  const [supportedLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ru', name: 'Русский' }
  ]);

  // Load profile for the current Supabase session and hydrate state.
  const hydrateFromSession = async () => {
    try {
      const response = await getUserProfile();
      const userData = response.user;
      if (userData) {
        setUser(userData);
        setBalance(userData.balance);
        fetchUserVipProgress();
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to hydrate session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Bootstrap: read existing session, then react to auth changes.
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session?.user) hydrateFromSession();
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setBalance(0);
        setVipProgress(null);
        setUserVipTier(null);
      } else if (session?.user) {
        // SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED
        hydrateFromSession();
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Live balance: subscribe to this user's profiles row. This single
  // subscription replaces every per-game `*-wallet` socket listener.
  useEffect(() => {
    if (!user?.id) return;
    const off = subscribeTable('profiles', {
      event: 'UPDATE',
      filter: `id=eq.${user.id}`,
      onUpdate: (row) => {
        if (row && row.balance != null) setBalance(Number(row.balance));
      },
    });
    return off;
  }, [user?.id]);

  // Fetch user VIP progress
  const fetchUserVipProgress = async () => {
    try {
      const progress = await getUserVipProgress();
      setVipProgress(progress);
      setUserVipTier(progress.currentTierDetails);
    } catch (err) {
      console.error('Failed to fetch VIP progress:', err);
    }
  };

  // Verify the signup email code (Supabase OTP).
  const verifyCode = async (verificationCode) => {
    try {
      const email = user?.email;
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup',
      });
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success('Verification successful');
      await hydrateFromSession();
      return { success: true };
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  // Called by LoginForm after authService.login() already established the
  // Supabase session. Keeps the same (userData, token) signature; token unused.
  const login = (userData /* , token */) => {
    setUser(userData);
    setBalance(userData?.balance ?? 0);
    fetchUserVipProgress();
  };

  const resendVerificationCode = async (email) => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
    } catch (error) {
      console.error('Resend code error:', error);
      throw error;
    }
  };

  // Called by RegisterForm after authService.register().
  const register = (userData /* , token */) => {
    setUser(userData);
    setBalance(userData?.balance ?? 0);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setBalance(0);
    setVipProgress(null);
    setUserVipTier(null);
  };

  const updateUserDetails = async (details) => {
    try {
      if (!user?.id) return;
      const { error } = await supabase
        .from('profiles')
        .update(details)
        .eq('id', user.id);
      if (error) throw error;
      setUser({ ...user, ...details });
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      resendVerificationCode,
      verifyCode,
      updateUserDetails,
      balance,
      setBalance,
      newScreen,
      setNewScreen,
      vipProgress,
      vipTiers,
      vipBenefits,
      supportedLanguages,
      userVipTier,
      fetchUserVipProgress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
