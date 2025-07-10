/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode palette
        'brand-light-bg': '#F1F0E8',
        'brand-light-bg-alt': '#E5E1DA',
        'brand-light-primary': '#89A8B2',
        'brand-light-secondary': '#B3C8CF',
        'brand-light-accent': '#B3C8CF',
        'brand-light-text': '#181C14',
        // Dark mode palette
        'brand-dark-bg': '#181C14',
        'brand-dark-bg-alt': '#3C3D37',
        'brand-dark-primary': '#697565',
        'brand-dark-secondary': '#ECDFCC',
        'brand-dark-accent': '#697565',
        'brand-dark-text': '#ECDFCC',
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