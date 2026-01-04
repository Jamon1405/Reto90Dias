import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slatebase: '#0b0f14',
        slatepanel: '#121a23',
        slateborder: '#1f2a35',
        accent: '#3ad6ff',
        danger: '#ff496a',
        warning: '#f5c542',
        success: '#21d19f',
      },
      boxShadow: {
        glow: '0 0 20px rgba(58,214,255,0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
};

export default config;
