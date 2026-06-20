/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#409eff',
        'primary-dark': '#3a8ee6',
        secondary: '#909399',
        accent: '#ecf5ff',
        'accent-dark': '#d9ecff',
        'dark-accent': '#1a2332',
        'dark-accent-dark': '#0d1520',
      },
      fontFamily: {
        sans: ['var(--vue-app-font-family)'],
      },
    },
  },
  plugins: [],
}