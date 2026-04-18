// Design System — MySteganography
// Inspired by: maximatherapy.com's bold geometric playfulness
// Our twist: dark midnight-navy base, coral + violet accents, pill UI, blob decorations

export const colors = {
  // Backgrounds
  bg: '#0D0E1A',           // midnight navy
  bgCard: '#13152B',       // slightly lighter card bg
  bgSection: '#1A1D35',    // section dividers
  bgLight: '#F5F0E8',      // cream (used sparingly for contrast blocks)

  // Accent palette (inspired by Maxima's bold primary colors)
  coral: '#FF6B5B',        // warm coral-orange (like Maxima's red)
  violet: '#7B5CF6',       // electric violet (like Maxima's blue)
  mint: '#3ECFB2',         // fresh mint (like Maxima's teal)
  amber: '#FFC95C',        // amber-gold (like Maxima's yellow)

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A8C0',
  textMuted: '#5A6080',
  textDark: '#0D0E1A',     // for use on light backgrounds

  // UI
  border: '#1E213D',
  borderLight: '#2A2E50',
  success: '#3ECFB2',
  warning: '#FFC95C',
  danger: '#FF6B5B',

  // Trust score colors
  trustHigh: '#3ECFB2',    // green mint
  trustMid: '#FFC95C',     // amber
  trustLow: '#FF6B5B',     // coral
};

export const typography = {
  // Bold, blocky headings (Maxima style)
  displayXL: { fontSize: 42, fontWeight: '900' as const, letterSpacing: -1.5, color: colors.textPrimary },
  displayL: { fontSize: 32, fontWeight: '900' as const, letterSpacing: -1, color: colors.textPrimary },
  displayM: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5, color: colors.textPrimary },
  heading: { fontSize: 20, fontWeight: '800' as const, color: colors.textPrimary },
  subheading: { fontSize: 16, fontWeight: '700' as const, color: colors.textSecondary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '600' as const, color: colors.textMuted },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,   // pill-shaped (key Maxima element)
};

export const shadows = {
  violet: {
    shadowColor: '#7B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  coral: {
    shadowColor: '#FF6B5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  mint: {
    shadowColor: '#3ECFB2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
};
