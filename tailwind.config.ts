import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: 'hsl(var(--brand-black))',
          dark: 'hsl(var(--brand-dark))',
          charcoal: 'hsl(var(--brand-charcoal))',
          gold: 'hsl(var(--brand-gold))',
          'gold-light': 'hsl(var(--brand-gold-light))',
          'gold-dark': 'hsl(var(--brand-gold-dark))',
          cream: 'hsl(var(--brand-cream))',
          white: 'hsl(var(--brand-white))',
          muted: 'hsl(var(--brand-muted))',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
