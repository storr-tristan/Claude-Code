/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hubspot: {
          orange: '#ff7a59',
          'dark-orange': '#f2552c',
          navy: '#0b2035',
          'light-gray': '#f5f8fa',
        },
      },
    },
  },
  plugins: [],
}
