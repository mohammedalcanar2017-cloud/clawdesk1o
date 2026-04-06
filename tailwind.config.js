/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-flash': 'border-flash 1.5s ease-in-out infinite',
      },
      keyframes: {
        'border-flash': {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#3b82f6' },
        }
      }
    },
  },
  plugins: [],
}