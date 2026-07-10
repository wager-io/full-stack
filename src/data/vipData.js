// VIP tier data with unique icons and colors
export const vipTiers = [
  {
    name: 'None',
    color: '#557086',
    wagerAmount: 'Below $10k',
    // Use a simpler SVG path format that's compatible with the rendering approach
    icon: {
      viewBox: "0 0 96 96",
      path: "M48 14.595l8.49 15.75a13.68 13.68 0 0 0 9.66 7.08L84 40.635l-12.39 12.9a13.9 13.9 0 0 0-3.9 9.63q-.069.96 0 1.92l2.46 17.76-15.66-7.56a15 15 0 0 0-6.51-1.53 15 15 0 0 0-6.6 1.5l-15.57 7.53 2.46-17.76q.051-.93 0-1.86a13.9 13.9 0 0 0-3.9-9.63L12 40.635l17.64-3.21a13.62 13.62 0 0 0 9.84-7.02zm0-12.54a5.22 5.22 0 0 0-4.59 2.73l-11.4 21.45a5.4 5.4 0 0 1-3.66 2.67l-24 4.32A5.25 5.25 0 0 0 0 38.385a5.13 5.13 0 0 0 1.44 3.6l16.83 17.55a5.16 5.16 0 0 1 1.47 3.6q.024.435 0 .87l-3.27 24a3 3 0 0 0 0 .72 5.19 5.19 0 0 0 5.19 5.22h.18a5.1 5.1 0 0 0 2.16-.6l21.39-10.32a6.4 6.4 0 0 1 2.76-.63 6.2 6.2 0 0 1 2.79.66l21 10.32c.69.377 1.464.573 2.25.57h.21a5.22 5.22 0 0 0 5.19-5.19q.024-.375 0-.75l-3.27-24q-.025-.375 0-.75a5 5 0 0 1 1.47-3.57l16.77-17.7a5.19 5.19 0 0 0-2.82-8.7l-24-4.32a5.22 5.22 0 0 1-3.69-2.76l-11.4-21.45a5.22 5.22 0 0 0-4.65-2.7"
    },
    features: ['Level Up bonuses']
  },
  {
    name: 'Bronze',
    color: '#C69C6D',
    wagerAmount: '$10k',
    icon: 'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M19.42 9.83l-3.13-.78a1.7 1.7 0 01-1.28-.79l-1.4-2.83a1.7 1.7 0 00-3.12 0l-1.4 2.83a1.7 1.7 0 01-1.28.79l-3.13.78a1.7 1.7 0 00-.92 2.9l2.26 2.2a1.72 1.72 0 01.49 1.52l-.54 3.13a1.7 1.7 0 002.48 1.74l2.8-1.47a1.72 1.72 0 011.6 0l2.8 1.47a1.7 1.7 0 002.48-1.74l-.54-3.13a1.72 1.72 0 01.49-1.52l2.26-2.2a1.7 1.7 0 00-.92-2.9z',
    features: ['Level Up bonuses', 'Rakeback', 'Weekly bonuses']
  },
  {
    name: 'Silver',
    color: '#B2CCCC',
    wagerAmount: '$50k',
    icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M20 12a8 8 0 11-16 0 8 8 0 0116 0z M14.12 14.12l2.83 2.83 M14.12 9.88l2.83-2.83 M9.88 9.88L7.05 7.05 M9.88 14.12l-2.83 2.83',
    features: ['Monthly bonuses', 'Level Up bonuses', 'Rakeback', 'Weekly bonuses']
  },
  {
    name: 'Gold',
    color: '#FED100',
    wagerAmount: '$100k',
    icon: 'M12 6v12 M17.196 9a6 6 0 11-10.392 0 M20 12a8 8 0 11-16 0 8 8 0 0116 0z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41',
    features: ['Monthly bonuses', 'Level Up bonuses', 'Rakeback', 'Weekly bonuses', 'Bonus growth']
  },
  {
    name: 'Platinum I-III',
    color: '#6FDDE7',
    wagerAmount: '$250k - $1M',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z M12 2v7 M12 22v-3 M2 9h7 M22 9h-3 M4 19l5-5 M20 19l-5-5',
    features: ['Monthly bonuses', 'Level Up bonuses', 'Rakeback', 'Weekly bonuses', 'Bonus growth', 'Daily bonuses / Reload']
  },
  {
    name: 'Platinum IV-VI',
    color: '#4ABED1',
    wagerAmount: '$2.5M - $10M',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z M12 2v7 M12 22v-3 M2 9h7 M22 9h-3 M4 19l5-5 M20 19l-5-5 M7 8l5 5 M17 8l-5 5',
    features: ['Monthly bonuses', 'Level Up bonuses', 'Rakeback', 'Weekly bonuses', 'Bonus growth', 'Daily bonuses / Reload', 'Daily bonuses / Reload']
  },
  {
    name: 'Diamond I-V',
    color: '#3B82F6',
    wagerAmount: '$25M',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    features: ['Monthly bonuses', 'Level Up bonuses', 'Rakeback', 'Weekly bonuses', 'Bonus growth', 'Daily bonuses / Reload', 'Daily bonuses / Reload']
  }
];

// VIP benefits data
export const vipBenefits = [
  {
    title: 'Boost',
    description: 'Every week and every month, expect a fresh bonus based on your recent games. The more you play, the higher the bonuses.',
    icon: '/assets/affiliate-icons/b1.webp'
  },
  {
    title: 'Recent Play Bonuses',
    description: 'Having a rough streak of luck? Wager offers money back on losses every time you level up.',
    icon: '/assets/affiliate-icons/b2.webp'
  },
  {
    title: 'Level-Ups',
    description: 'Reach a new level and get paid. The level-ups get better the higher you go.',
    icon: '/assets/affiliate-icons/b3.webp'
  },
  {
    title: 'VIP Host',
    description: 'Receive your own dedicated VIP host who will support and cater to your betting needs.',
    icon: '/assets/affiliate-icons/b4.webp'
  },
  {
    title: 'Bespoke benefits',
    description: 'Work with your dedicated VIP host to tailor benefits to your gaming needs.',
    icon: '/assets/affiliate-icons/b4.webp'
  }
];

// Languages available for support
export const supportedLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian'];

// Get VIP tier by user level
export const getUserVipTier = (level) => {
  if (!level) return vipTiers[0]; // Default to None
  
  if (level < 5) return vipTiers[0]; // None
  if (level < 10) return vipTiers[1]; // Bronze
  if (level < 25) return vipTiers[2]; // Silver
  if (level < 50) return vipTiers[3]; // Gold
  if (level < 100) return vipTiers[4]; // Platinum I-III
  if (level < 200) return vipTiers[5]; // Platinum IV-VI
  return vipTiers[6]; // Diamond I-V
};