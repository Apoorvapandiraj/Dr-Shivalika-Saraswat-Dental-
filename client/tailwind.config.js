/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#1D1413',
          900: '#2A1B19',
          800: '#3B2824',
        },
        neon: {
          cyan: '#D33616',
          blue: '#CF8976',
        },
        champagne: '#C98A3A',
        gold: '#D9B77D',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
