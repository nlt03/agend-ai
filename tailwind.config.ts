import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // DM Sans replaces the default sans stack
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Kanit for the "Agend.AI" wordmark only (splash + signup)
        logo: ['Kanit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        primary: {
          DEFAULT: '#5678FF',
          soft: '#A2B4FC',
        },
        surface: '#F1F2F6',
        // body text and secondary text — WCAG AA safe on white and surface
        text: {
          DEFAULT: '#23202C',
          muted: '#5A5766',
        },
        // event / category label colors — all take dark text (text.DEFAULT)
        label: {
          cyan: '#56CBF9',
          pink: '#FF729F',
          orange: '#E67F0D',
          purple: '#726DA8', // prefer white text on purple fills (4.70:1); dark only at large size
          green: '#A7E8BD',
        },
        // status colors — success/warning fills always take dark text (white fails AA)
        error: '#FF5760',
        success: '#22D489',
        warning: '#FFD15A',
      },
    },
  },
  plugins: [],
}

export default config
