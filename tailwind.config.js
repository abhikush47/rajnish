/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Red Brand Colors
        primary: {
          50:  '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ff9f9f',
          400: '#ff6b6b',
          500: '#ff3333',
          600: '#ed1515',
          700: '#c80d0d',
          800: '#a50f0f',
          900: '#881414',
          950: '#4b0404',
        },
        // Dark backgrounds
        dark: {
          50:  '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#0a0a0a',
        },
        // Gold accent
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Nepal flag colors
        nepal: {
          red:    '#dc143c',
          blue:   '#003087',
          crimson:'#b8001f',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        nepali:  ['var(--font-nepali)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'red-gradient':    'linear-gradient(135deg, #c80d0d 0%, #ff3333 50%, #ed1515 100%)',
        'dark-gradient':   'linear-gradient(180deg, #0a0a0a 0%, #1a0505 100%)',
        'hero-gradient':   'linear-gradient(135deg, #0a0a0a 0%, #1a0000 40%, #2d0000 100%)',
        'card-gradient':   'linear-gradient(145deg, rgba(200,13,13,0.1) 0%, rgba(10,10,10,0.8) 100%)',
        'noise':           "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'pulse-red':      'pulseRed 2s ease-in-out infinite',
        'slide-up':       'slideUp 0.6s ease-out forwards',
        'fade-in':        'fadeIn 0.8s ease-out forwards',
        'marquee':        'marquee 30s linear infinite',
        'spin-slow':      'spin 8s linear infinite',
        'glow':           'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,13,13,0.4)' },
          '50%':      { boxShadow: '0 0 60px rgba(200,13,13,0.8)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glow: {
          from: { textShadow: '0 0 20px rgba(255,51,51,0.5)' },
          to:   { textShadow: '0 0 40px rgba(255,51,51,0.9), 0 0 80px rgba(255,51,51,0.4)' },
        },
      },
      boxShadow: {
        'red-glow':   '0 0 30px rgba(200,13,13,0.5)',
        'red-heavy':  '0 0 60px rgba(200,13,13,0.8)',
        'card':       '0 4px 30px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 60px rgba(200,13,13,0.3)',
        'inner-red':  'inset 0 0 30px rgba(200,13,13,0.2)',
      },
      borderColor: {
        'red-dim': 'rgba(200,13,13,0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
