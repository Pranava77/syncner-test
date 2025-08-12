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
        // Dark mode colors (existing)
        offblack: '#121212',
        paperwhite: '#FAFAFA',
        trueturquoise: '#00B8D9',
        teallight: '#A0D8EF',
        rust: '#B7410E',
        
        // Light mode colors
        'offblack-light': '#1F2937',
        'paperwhite-light': '#FFFFFF',
        'trueturquoise-light': '#0891B2',
        'teallight-light': '#0EA5E9',
        'rust-light': '#DC2626',
        
        // Semantic colors for both themes
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
      },
      animation: {
        'bounce': 'bounce 1s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};