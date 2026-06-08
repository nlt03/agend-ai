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
      // ---------------------------------------------------------------------------
      // Type scale (spec: H1 28/1.3, H2 22/1.3, H3 18/1.4, body 15/1.5, caption 12)
      // ---------------------------------------------------------------------------
      fontSize: {
        'h1':      ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2':      ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3':      ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body':    ['15px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4' }],
      },
      // ---------------------------------------------------------------------------
      // Radii (spec: card 20px, button 14px, input 12px, modal 28px, pill 9999px)
      // ---------------------------------------------------------------------------
      borderRadius: {
        'card':  '20px',
        'btn':   '14px',
        'input': '12px',
        'modal': '28px',
      },
      // ---------------------------------------------------------------------------
      // Shadows (spec: card 0 4px 20px rgba(35,32,44,0.08))
      // ---------------------------------------------------------------------------
      boxShadow: {
        card: '0 4px 20px rgba(35,32,44,0.08)',
      },
      animation: {
        'fade-in':     'fadeIn 0.25s ease-out both',
        'slide-in':    'slideIn 0.3s ease-out both',
        'splash-pulse': 'splashPulse 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Spec: opacity 0.85→1→0.85, scale 1.0→1.06→1.0, 1.8s easeInOut
        splashPulse: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1.0)' },
          '50%':      { opacity: '1',    transform: 'scale(1.06)' },
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
        // event / category label colors — all take dark text (text.DEFAULT) on tint fills
        label: {
          cyan:    '#56CBF9',
          pink:    '#FF729F',
          orange:  '#E67F0D',
          // purple: dark text safe on tint fills only (never dark text on full-sat fill at small size)
          purple:  '#726DA8',
          green:   '#A7E8BD',
        },
        // status colors — success/warning fills always take dark text (white fails AA)
        error:   '#FF5760',
        success: '#22D489',
        warning: '#FFD15A',
      },
    },
  },
  plugins: [],
}

export default config
