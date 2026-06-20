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
        primary: '#6366f1',       // indigo-500
        'primary-dark': '#4f46e5', // indigo-600
        secondary: '#4f46e5',      // indigo-600
        accent: '#818cf8',         // indigo-400
        'accent-dark': '#a5b4fc',  // indigo-300
      },
      fontFamily: {
        sans: ['var(--vue-app-font-family)'],
      },
    },
  },
  plugins: [],
}
