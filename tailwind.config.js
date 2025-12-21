/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        secondary: '#059669',
      },
      fontFamily: {
        sans: ['var(--vue-app-font-family)'],
      },
    },
  },
  plugins: [],
}
