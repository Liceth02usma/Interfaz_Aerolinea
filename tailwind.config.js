/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,js,mjs}", "./resources/**/*.{html,js,mjs}"],
  theme: {
    extend: {
      margin: {
        '50%': '50%',
      },
      flexGrow: {
        2: '2'
      }
    },
  },
  plugins: [],
}

