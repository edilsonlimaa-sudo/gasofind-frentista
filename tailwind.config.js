/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update to include all files that contain NativeWind classes.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──────────────────────────────────────────────
        'bg-base': '#080C12',
        'bg-surface': '#0F1520',
        'bg-border': '#1C2A3A',
        // ── Text ─────────────────────────────────────────────────────
        'text-primary': '#E2EAF2',
        'text-muted': '#6B7F95',
        // ── Semantic status ──────────────────────────────────────────
        'status-green': '#00E5A0',
        'status-red': '#FF3F5B',
        'status-amber': '#FFB020',
        'status-blue': '#2979FF',
        // ── Brand accent ─────────────────────────────────────────────
        accent: '#00B8D9',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-bold': ['Inter_700Bold'],
        display: ['SpaceGrotesk_600SemiBold'],
        'display-bold': ['SpaceGrotesk_700Bold'],
        mono: ['SpaceMono_400Regular'],
        'mono-bold': ['SpaceMono_700Bold'],
      },
      fontSize: {
        label: ['12px', { lineHeight: '16px' }],
        body: ['16px', { lineHeight: '24px' }],
        section: ['36px', { lineHeight: '44px' }],
        hero: ['64px', { lineHeight: '72px' }],
        data: ['48px', { lineHeight: '56px' }],
      },
    },
  },
  plugins: [],
};
