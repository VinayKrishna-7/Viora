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
        viora: {
          bg: '#090a10',
          surface: '#10131e',
          surfaceHover: '#171b2b',
          card: '#141726',
          cardHover: '#1b2034',
          border: 'rgba(255, 255, 255, 0.07)',
          borderHover: 'rgba(255, 255, 255, 0.14)',
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            muted: '#64748b',
          },
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          violet: '#7c3aed',
          cyan: '#06b6d4',
        },
        dark: {
          bg: '#090a10',
          surface: '#10131e',
          card: '#141726',
          hover: '#1b2034',
          border: 'rgba(255, 255, 255, 0.07)',
          text: '#f8fafc',
          muted: '#94a3b8'
        },
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          card: '#ffffff',
          hover: '#f1f5f9',
          border: '#e2e8f0',
          text: '#0f172a',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'viora-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'viora-glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
}
