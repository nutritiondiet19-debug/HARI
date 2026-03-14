export const Colors = {
  // Primary palette
  primary: '#22c55e',
  primaryLight: '#4ade80',
  primaryDark: '#16a34a',
  secondary: '#3b82f6',
  secondaryLight: '#60a5fa',
  secondaryDark: '#2563eb',

  // Accent
  accentOrange: '#f97316',
  accentPurple: '#a855f7',
  accentBlue: '#38bdf8',

  // Backgrounds
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',

  // Dark mode
  darkBackground: '#0f172a',
  darkSurface: '#1e293b',
  darkCard: '#1e293b',
  darkBorder: '#334155',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  textInverse: '#ffffff',

  // Status
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Gradient presets
  gradientGreen: ['#22c55e', '#16a34a'],
  gradientBlue: ['#3b82f6', '#1d4ed8'],
  gradientOrange: ['#f97316', '#ea580c'],
  gradientPurple: ['#a855f7', '#7c3aed'],
  gradientHero: ['#22c55e', '#3b82f6'],
};

export const DarkColors = {
  ...Colors,
  background: '#0f172a',
  surface: '#1e293b',
  card: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textLight: '#64748b',
  border: '#334155',
  borderLight: '#1e293b',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
