/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Mesa hospitality palette. Source of truth: mesa-core/src/tokens.ts.
      // Keep in lockstep with mesa-admin/src/app/globals.css.
      colors: {
        ink: '#17150f',
        ink2: '#2b2820',
        slate: '#3a372f',
        mute: '#6e6a5e',
        line: '#e3ddd1',
        paper: '#faf7f1',
        chalk: '#ffffff',
        sand: '#efe9dc',
        terracotta: '#b4563a',
        'terracotta-d': '#9a4630',
        olive: '#5b6b4e',
        brass: '#c9973f',
        ok: '#2f8f5b',
        'ok-bg': '#e7f4ec',
        warn: '#b5730f',
        'warn-bg': '#fdf3e0',
        danger: '#b3261e',
        'danger-bg': '#fdecea',
        info: '#2f5f8f',
        'info-bg': '#e8f0f8',
      },
      fontFamily: {
        sans: ['HankenGrotesk_400Regular'],
        medium: ['HankenGrotesk_500Medium'],
        semibold: ['HankenGrotesk_600SemiBold'],
        bold: ['HankenGrotesk_700Bold'],
        extrabold: ['HankenGrotesk_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
