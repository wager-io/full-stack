// Supabase-backed VIP service. Same exported function names and return shapes
// (currentTier/nextTier/progress/currentTierDetails/...) as before.
import { supabase } from '../lib/supabase';

async function fetchTiers() {
  const { data, error } = await supabase
    .from('vip_tiers')
    .select('*')
    .order('level', { ascending: true });
  if (error) throw error;
  return (data || []).map((t) => ({
    name: t.name,
    color: t.color,
    wagerAmount: t.wager_amount,
    icon: t.icon,
    features: t.features || [],
    requiredWager: Number(t.required_wager),
    level: t.level,
  }));
}

const DEFAULT_PROGRESS = {
  currentTier: 'None',
  nextTier: 'Bronze',
  progress: 0,
  currentTierDetails: { name: 'None', color: '#2F4553', features: ['Level Up bonuses'] },
  nextTierDetails: { name: 'Bronze', color: '#C69C6D', features: ['Level Up bonuses', 'Rakeback', 'Weekly bonuses'] },
  totalWager: 0,
  nextTierRequirement: 10000,
};

// Get user's VIP progress (computed from vip_progress + vip_tiers).
export const getUserVipProgress = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_PROGRESS;

    const [tiers, progressRes] = await Promise.all([
      fetchTiers(),
      supabase.from('vip_progress').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    const wager = Number(progressRes.data?.current_wager ?? 0);
    const sorted = tiers.sort((a, b) => a.requiredWager - b.requiredWager);
    let current = sorted[0];
    let next = sorted[1] || null;
    for (let i = 0; i < sorted.length; i++) {
      if (wager >= sorted[i].requiredWager) {
        current = sorted[i];
        next = sorted[i + 1] || null;
      }
    }
    const span = next ? next.requiredWager - current.requiredWager : 0;
    const progress = next && span > 0
      ? Math.min(100, Math.max(0, ((wager - current.requiredWager) / span) * 100))
      : 100;

    return {
      currentTier: current.name,
      nextTier: next?.name ?? current.name,
      progress,
      currentTierDetails: current,
      nextTierDetails: next ?? current,
      totalWager: wager,
      nextTierRequirement: next?.requiredWager ?? current.requiredWager,
    };
  } catch (error) {
    console.error('Error fetching VIP progress:', error);
    return DEFAULT_PROGRESS;
  }
};

// Get all VIP tiers
export const getAllVipTiers = async () => {
  try {
    return await fetchTiers();
  } catch (error) {
    console.error('Error fetching VIP tiers:', error);
    throw error;
  }
};
