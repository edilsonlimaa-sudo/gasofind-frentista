// ─────────────────────────────────────────────────────────────
// DESIGN SYSTEM — Control Room Aesthetics (shared with gandola)
// Dark-only palette mirroring the web app tokens.
// ─────────────────────────────────────────────────────────────

import '@/global.css';

import { Platform } from 'react-native';

// ── Semantic color tokens ────────────────────────────────────
// Keys keep backward compatibility with ThemedText / ThemedView.
export const Colors = {
  // Base aliases (used by ThemedText/ThemedView defaults)
  text: '#E2EAF2',
  background: '#080C12',
  backgroundElement: '#0F1520',
  backgroundSelected: '#1C2A3A',
  textSecondary: '#6B7F95',

  // Full semantic set
  bgBase: '#080C12',
  bgSurface: '#0F1520',
  bgBorder: '#1C2A3A',
  textPrimary: '#E2EAF2',
  textMuted: '#6B7F95',
  statusGreen: '#00E5A0',
  statusRed: '#FF3F5B',
  statusAmber: '#FFB020',
  statusBlue: '#2979FF',
  accent: '#00B8D9',
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

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
