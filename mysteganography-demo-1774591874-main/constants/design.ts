// Design System — MySteganography
// Inspired by: maximatherapy.com's bold geometric playfulness
// Our twist: dark midnight-navy base, coral + violet accents, pill UI, blob decorations

export const colors = {
  // Backgrounds
  bg: '#05070A',           // deep cyberpunk black
  bgCard: '#0C0E14',       // tech card bg
  bgSection: '#14171F',    // UI sections
  bgLight: '#EBEDF0',      // for contrast

  // Neon Cyberpunk palette
  mint: '#00FFCC',         // Neon Mint
  violet: '#8A2BE2',       // Blueviolet / Electric Violet
  coral: '#FF2E63',        // Neon Pink/Coral
  amber: '#FFD700',        // Cyber gold

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textDark: '#05070A',

  // UI
  border: '#1E293B',
  borderLight: '#334155',
  success: '#00FFCC',
  warning: '#FFD700',
  danger: '#FF2E63',

  // Glows
  glowMint: '#00FFCC44',
  glowViolet: '#8A2BE244'
};

export const typography = {
  displayXL: { fontSize: 48, fontWeight: '900' as const, letterSpacing: -2, color: colors.textPrimary },
  displayL: { fontSize: 36, fontWeight: '900' as const, letterSpacing: -1.5, color: colors.textPrimary },
  displayM: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5, color: colors.textPrimary },
  heading: { fontSize: 22, fontWeight: '800' as const, color: colors.textPrimary },
  subheading: { fontSize: 16, fontWeight: '600' as const, color: colors.textSecondary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '700' as const, color: colors.textMuted, letterSpacing: 1 },
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 28,
  xl: 40,
  xxl: 60,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  pill: 999,
};

export const shadows = {
  mint: {
    shadowColor: colors.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  violet: {
    shadowColor: colors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
};

