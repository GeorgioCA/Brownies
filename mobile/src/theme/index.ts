import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════
// BROWNIES DESIGN SYSTEM
// Extracted from theme.txt + admin dashboard
// ═══════════════════════════════════════════

export const colors = {
  // Brown Family
  brown900: '#2d1810',
  brown800: '#4a2c20',
  brown700: '#6b3f2e',
  brown600: '#8b5a3c',
  brown500: '#a8774f',
  brown400: '#c49a78',
  brown300: '#d9b99e',
  brown200: '#ebd9c8',
  brown100: '#f5ebe1',
  brown50:  '#fcf8f3',

  // Gold / Accent
  gold:      '#d4a358',
  goldLight: '#f0d6a8',

  // Rose / Error
  rose:      '#e8736a',
  roseDark:  '#c94d44',

  // Neutrals
  cream:      '#fff8f0',
  white:      '#ffffff',
  text:       '#2d1810',
  textMuted:  '#8b7a6e',
  success:    '#22c55e',
  error:      '#ef4444',

  // Tab
  tabInactive: '#aaaaaa',

  // Intent colors
  intentCasualBg:  '#FEF2F2',
  intentCasualFg:  '#DC2626',
  intentSeriousBg: '#F5EBE1',
  intentSeriousFg: '#6B3F2E',
  intentFriendBg:  '#F0FDF4',
  intentFriendFg:  '#16A34A',
  intentLetsSeeBg: '#F5EBE1',
  intentLetsSeeFg: '#A8774F',

  // Overlay
  overlay: 'rgba(45,24,16,0.5)',
};

export const gradients = {
  buttonPrimary: ['#6b3f2e', '#4a2c20'] as const,
  buttonGold: ['#d4a358', '#c49a78'] as const,
  heroAccent: ['#6b3f2e', '#d4a358'] as const,
  stepCircle: ['#8b5a3c', '#6b3f2e'] as const,
  footer: ['#2d1810', '#1a0e0a'] as const,
  profilePlaceholder: ['#f5ebe1', '#ebd9c8', '#d9b99e'] as const,
  matchOverlay: ['rgba(212,163,88,0.15)', 'transparent'] as const,
  cardShadow: ['transparent', 'rgba(45,24,16,0.4)'] as const,
};

export const shadows = {
  card: {
    shadowColor: '#2d1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardLg: {
    shadowColor: '#2d1810',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 12,
  },
  button: {
    shadowColor: '#4a2c20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonHover: {
    shadowColor: '#4a2c20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 10,
  },
  likeBtn: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  nopeBtn: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  superBtn: {
    shadowColor: '#d4a358',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const radii = {
  full: 60,
  card: 20,
  medium: 16,
  small: 12,
  xs: 10,
  tiny: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 60,
  '7xl': 80,
  '8xl': 100,
};

export const typography = StyleSheet.create({
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : undefined,
    fontWeight: '800',
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  },
  bodyLarge: {
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
  body: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  bodySmall: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  caption: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  overline: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.brown500,
  },
  button: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
  navLogo: {
    fontWeight: '800',
    fontSize: 21,
    lineHeight: 26,
    color: colors.brown900,
  },
});

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  padding: spacing.lg,
};
