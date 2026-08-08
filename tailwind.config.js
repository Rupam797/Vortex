/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#43459b',
          card: '#353782',
          dark: '#2a2b69',
          surface: '#3b3d8c',
          coral: '#ff7f5d',
          'coral-hover': '#e06847',
          'coral-light': '#ff9e85',
          white: '#ffffff',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'Plus Jakarta Sans', '-apple-system', 'sans-serif'],
      },
      animation: {
        'radar-pulse': 'radar-pulse 3s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        'radar-pulse': {
          '0%': { transform: 'scale(0.2)', opacity: '0.8' },
          '50%': { opacity: '0.4' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 127, 93, 0.5)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 127, 93, 0.85)' },
        },
      },
      borderRadius: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
