// ─────────────────────────────────────────────────────────────
// DESIGN SYSTEM — Control Room Aesthetics
// Dark-only palette for gas station point-of-sale system
// ─────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

// ── Semantic color tokens ────────────────────────────────────
export const Colors = {
  // Base background tones
  bgBase: '#080C12',
  bgSurface: '#0F1520',
  bgBorder: '#1C2A3A',
  
  // Text colors
  textPrimary: '#E2EAF2',
  textMuted: '#6B7F95',
  
  // Status colors
  statusGreen: '#00E5A0',
  statusRed: '#FF3F5B',
  statusAmber: '#FFB020',
  statusBlue: '#2979FF',
  
  // Accent
  accent: '#00B8D9',
  accentHover: '#00A0C0',
} as const;

export type ThemeColor = keyof typeof Colors;

// ── Typography ───────────────────────────────────────────────
// Font family names match the loaded @expo-google-fonts packages.
export const Fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
} as const;

// ── Spacing scale ────────────────────────────────────────────
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ── Platform-specific constants ──────────────────────────────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
