// frontend/design-review-app/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mongodb: {
          lavender: '#F9F6FF',
          mist: '#E3FCF7',
          white: '#FFFFFF',
          slate: '#001E2B',
          evergreen: '#023430',
          forest: '#00684A',
          spring: '#00ED64'
        }
      }
    },
  },
  plugins: [],
}