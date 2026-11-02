/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#05070f',
          800: '#0a0f1d',
          700: '#11182c',
          600: '#1b2542'
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          cyan: '#00e5ff'
        }
      }
    },
  },
  plugins: [],
}
