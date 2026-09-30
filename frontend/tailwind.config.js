/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#12211c',
        panel: '#1b2d26',
        'panel-light': '#243b32',
        'panel-border': '#2a443a',
        'panel-hover': '#21372e',
        amber: {
          DEFAULT: '#e6a94a',
          light: '#f5c378',
          dark: '#c4892c',
          muted: 'rgba(230, 169, 74, 0.15)',
        },
        sage: {
          DEFAULT: '#8fa598',
          light: '#b0c3b7',
          dark: '#688273',
          muted: 'rgba(143, 165, 152, 0.15)',
        },
        emerald: {
          accent: '#34d399',
          glow: 'rgba(52, 211, 153, 0.2)',
        },
        coral: {
          DEFAULT: '#f87171',
          muted: 'rgba(248, 113, 113, 0.15)',
        }
      },
      fontFamily: {
        headline: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 25px -5px rgba(230, 169, 74, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(52, 211, 153, 0.25)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        crateBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'crate-bounce': 'crateBounce 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
