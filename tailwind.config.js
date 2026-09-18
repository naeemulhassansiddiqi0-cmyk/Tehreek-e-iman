/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        scheherazade: ['"Scheherazade New"', 'serif'],
        nastaliq: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaliq"', 'serif'],
        lateef: ['Lateef', 'cursive', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2f8f5',
          100: '#e1f0e9',
          200: '#c3e1d4',
          300: '#97cbb6',
          400: '#65ad94',
          500: '#419177',
          600: '#2f745e',
          700: '#275d4d',
          800: '#1a4337',
          900: '#113229',
          950: '#091d17',
        },
        gold: {
          50: '#fbf8ee',
          100: '#f5edd2',
          200: '#ecdaa6',
          300: '#dfc272',
          400: '#d2a744',
          500: '#be8f2e',
          600: '#a37123',
          700: '#82531e',
          800: '#6d431e',
          900: '#5c371d',
          950: '#351d0d',
        },
        parchment: {
          50: '#fdfbf7',
          100: '#f8f4ea',
          200: '#f1e9d5',
          300: '#e5d7b7',
          400: '#d4bf93',
          500: '#c5a773',
        }
      }
    },
  },
  plugins: [],
}
