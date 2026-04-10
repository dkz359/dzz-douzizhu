/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shiba: {
          orange: '#F5A623',
          yellow: '#F8E71C',
          brown: '#8B572A',
          cream: '#FFF8E7',
          dark: '#4A3728',
        }
      },
      fontFamily: {
        shiba: ['Comic Sans MS', ' cursive', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
