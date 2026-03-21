/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'mist': '#F5F5F3',
        'mist-deep': '#EDEDEA',
        'fir': '#2C2C2A',
        'fir-light': '#5C5C58',
        'fir-ghost': '#9C9C96',
        'moss': '#6B7F6A',
        'moss-light': '#8FA38E',
        'moss-pale': '#E8EEE7',
        'calm': '#6A7B8F',
        'calm-light': '#8A9BAF',
        'calm-pale': '#E7ECF2',
        'basalt': '#141414',
        'basalt-mid': '#1E1E1E',
        'basalt-high': '#262626',
        'moon': '#C8C8C4',
        'moon-dim': '#888884',
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(44, 44, 42, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 2px 16px rgba(44, 44, 42, 0.06), 0 1px 4px rgba(44, 44, 42, 0.04)',
        'card-hover': '0 8px 32px rgba(44, 44, 42, 0.12), 0 2px 8px rgba(44, 44, 42, 0.06)',
        'card-dark': '0 2px 16px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)',
        'card-hover-dark': '0 8px 32px rgba(0,0,0,0.5)',
        'portal': '0 0 0 1.5px rgba(107, 127, 106, 0.3), 0 8px 32px rgba(107, 127, 106, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fall-in': 'fallIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow': 'spin 2s linear infinite',
        'absorb': 'absorb 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fallIn: {
          '0%': { transform: 'translateY(-20px) rotate(-2deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(12px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateX(100%) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        absorb: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.97)', opacity: '0.85' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

