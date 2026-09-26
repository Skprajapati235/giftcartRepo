/**
 * GiftFestive Design System & Theme Tokens
 * Harmonized with giftfestive-main web application
 */

export const colors = {
  // Brand Primary & Accents
  primary: '#D82B76',          // Vibrant festive rose / magenta
  secondary: '#FF6A3D',        // Festive coral / orange
  brandBerry: '#741343',       // Royal berry wine (headers, badges, hero, main CTA)
  brandBerryDark: '#590e33',   // Deep berry shade
  brandGold: '#ffd166',        // Warm festive gold (highlights, stars, cart icons)
  brandGoldDark: '#d4a320',    // Darker gold accent
  brandCream: '#fffaf3',       // Warm luxury ivory cream (cards, backgrounds)
  brandCreamAlt: '#FFF5F8',    // Soft blush cream tint
  
  // Neutral & Surface
  background: '#f8f9fa',       // Clean app background
  surface: '#ffffff',          // Card & modal surface
  surfaceWarm: '#fffaf3',      // Warm card surface
  white: '#ffffff',
  black: '#000000',
  
  // Borders
  borderWarm: '#ead6c5',       // Warm golden-peach card border
  borderRose: '#e7b8c9',       // Soft rose border
  borderLight: '#f1f1f1',      // Subtle divider border
  borderDark: '#2b2b2d',
  
  // Typography
  textDark: '#1a1a1a',         // Primary text
  textBerry: '#741343',        // Brand heading text
  textMuted: '#6b7280',        // Secondary text
  textLight: '#9ca3af',        // Tertiary / placeholder text
  textWhite: '#ffffff',
  
  // Status Colors
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#ea580c',
  warningBg: '#fff7ed',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',
  star: '#ffd166',
  starFilled: '#FBBF24',

  // Night Mode / Delivery Restrictions
  nightDark: '#21091a',
  nightMid: '#3a0e28',
  nightAccent: '#ffd166',
};

export const shadows = {
  sm: {
    shadowColor: '#741343',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#741343',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#741343',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  button: {
    shadowColor: '#741343',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const typography = {
  headingBlack: {
    fontWeight: '900',
    color: colors.textBerry,
  },
  headingBold: {
    fontWeight: '800',
    color: colors.textDark,
  },
  subheading: {
    fontWeight: '700',
    color: colors.textMuted,
  },
};

export default {
  colors,
  shadows,
  typography,
};
