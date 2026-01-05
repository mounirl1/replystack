/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Perplexity-inspired palette
        primary: {
          50: '#E6F9FB',
          100: '#CCF3F7',
          200: '#99E7EF',
          300: '#66DBE7',
          400: '#33CFDF',
          500: '#20B8CD', // Main accent
          600: '#1A93A4',
          700: '#136E7B',
          800: '#0D4A52',
          900: '#062529',
        },
        dark: {
          bg: '#191A1A',        // Main dark background
          surface: '#232525',   // Cards, sidebar
          hover: '#2D2F2F',     // Hover states
          border: '#343636',    // Subtle borders
          'border-light': '#404242',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F9FAFB',
          hover: '#F3F4F6',
          border: '#E5E7EB',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9BA1A6',
          tertiary: '#6B7280',
          'dark-primary': '#111827',
          'dark-secondary': '#6B7280',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.3)',
        'card-light': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        '150': '150ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
