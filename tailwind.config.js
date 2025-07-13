/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'FK Grotesk',
          'Inter',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontWeight: {
        heading: '700',
        label: '600',
      },
      fontSize: {
        heading1: ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        heading2: ['2rem', { lineHeight: '1.15', fontWeight: '700' }],
        heading3: ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        body: ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
        label: ['0.875rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }],
      },
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