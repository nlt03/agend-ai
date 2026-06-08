import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        logo: ['Kanit', 'sans-serif'],
      },
      fontSize: {
        'h1':      ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2':      ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3':      ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body':    ['15px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        'card':  '20px',
        'btn':   '14px',
        'input': '12px',
        'modal': '28px',
      },
      boxShadow: {
        // CSS variable so dark mode can deepen the shadow without JS.
        card: 'var(--shadow-card)',
      },
      animation: {
        'fade-in':      'fadeIn 0.25s ease-out both',
        'slide-in':     'slideIn 0.3s ease-out both',
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
        splashPulse: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1.0)' },
          '50%':      { opacity: '1',    transform: 'scale(1.06)' },
        },
      },
      colors: {
        // All semantic colors use rgb(var(--c-x) / <alpha-value>) so Tailwind
        // opacity modifiers (bg-primary/10, text-text/50, etc.) keep working.
        primary: {
          DEFAULT: 'rgb(var(--c-primary) / <alpha-value>)',
          soft:    'rgb(var(--c-primary-soft) / <alpha-value>)',
        },
        // page / screen background (darkest layer in dark mode)
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        // raised cards, headers, sheets — replaces bg-white on elevated surfaces
        card:    'rgb(var(--c-card) / <alpha-value>)',
        text: {
          DEFAULT: 'rgb(var(--c-text) / <alpha-value>)',
          muted:   'rgb(var(--c-text-muted) / <alpha-value>)',
        },
        label: {
          cyan:   'rgb(var(--c-label-cyan) / <alpha-value>)',
          pink:   'rgb(var(--c-label-pink) / <alpha-value>)',
          orange: 'rgb(var(--c-label-orange) / <alpha-value>)',
          purple: 'rgb(var(--c-label-purple) / <alpha-value>)',
          green:  'rgb(var(--c-label-green) / <alpha-value>)',
        },
        error:   'rgb(var(--c-error) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warning: 'rgb(var(--c-warning) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}

export default config
