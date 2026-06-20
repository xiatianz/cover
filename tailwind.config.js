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
        primary: '#475569',       // slate-600
        'primary-dark': '#334155', // slate-700
        secondary: '#64748b',      // slate-500
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
