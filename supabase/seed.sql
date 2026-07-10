-- Seed reference data. Applied by `supabase db reset`.
-- VIP tiers ported verbatim from stake-cloneBackend/scripts/seed-vip-data.js.

do $$
declare
  star text := 'm48 14.595 8.49 15.75a13.68 13.68 0 0 0 9.66 7.08L84 40.635l-12.39 12.9a13.9 13.9 0 0 0-3.9 9.63q-.069.96 0 1.92l2.46 17.76-15.66-7.56a15 15 0 0 0-6.51-1.53a15 15 0 0 0-6.6 1.5l-15.57 7.53 2.46-17.76q.051-.93 0-1.86a13.9 13.9 0 0 0-3.9-9.63L12 40.635l17.64-3.21a13.62 13.62 0 0 0 9.84-7.02zm0-12.54a5.22 5.22 0 0 0-4.59 2.73l-11.4 21.45a5.4 5.4 0 0 1-3.66 2.67l-24 4.32A5.25 5.25 0 0 0 0 38.385a5.13 5.13 0 0 0 1.44 3.6l16.83 17.55a5.16 5.16 0 0 1 1.47 3.6q.024.435 0 .87l-3.27 24a3 3 0 0 0 0 .72 5.19 5.19 0 0 0 5.19 5.22h.18a5.1 5.1 0 0 0 2.16-.6l21.39-10.32a6.4 6.4 0 0 1 2.76-.63 6.2 6.2 0 0 1 2.79.66l21 10.32c.69.377 1.464.573 2.25.57h.21a5.22 5.22 0 0 0 5.19-5.19q.024-.375 0-.75l-3.27-24q-.025-.375 0-.75a5 5 0 0 1 1.47-3.57l16.77-17.7a5.19 5.19 0 0 0-2.82-8.7l-24-4.32a5.22 5.22 0 0 1-3.69-2.76l-11.4-21.45a5.22 5.22 0 0 0-4.65-2.7';
  icon jsonb;
begin
  icon := jsonb_build_object('viewBox', '0 0 96 96', 'path', star);

  insert into public.vip_tiers (name, color, wager_amount, icon, features, required_wager, level) values
    ('None',     '#2F4553', 'Below $10k', icon, array['Level Up bonuses'], 0, 0),
    ('Bronze',   '#C69C6D', '$10k',  icon, array['Level Up bonuses','Rakeback','Weekly bonuses'], 10000, 10),
    ('Silver',   '#B2CCCC', '$50k',  icon, array['Level Up bonuses','Rakeback','Weekly bonuses','Monthly bonuses'], 50000, 25),
    ('Gold',     '#FFD700', '$250k', icon, array['All previous benefits','Priority withdrawals','Dedicated host'], 250000, 50),
    ('Platinum', '#E5E4E2', '$1M',   icon, array['All previous benefits','Exclusive events','Custom promotions'], 1000000, 100);
end $$;
