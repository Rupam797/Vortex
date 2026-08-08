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
          bg: '#ffffff',
          card: '#ff7f5d',
          'card-hover': '#e06847',
          indigo: '#43459b',
          'indigo-dark': '#303273',
          'indigo-light': '#5e60bd',
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
          '0%, 100%': { boxShadow: '0 0 15px rgba(67, 69, 155, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(67, 69, 155, 0.75)' },
        },
      },
      borderRadius: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
