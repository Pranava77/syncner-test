/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        offblack: '#121212',
        paperwhite: '#FAFAFA',
        trueturquoise: '#00B8D9',
        teallight: '#A0D8EF',
        rust: '#B7410E',
      },
      animation: {
        'bounce': 'bounce 1s infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};