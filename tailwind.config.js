/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: "#f8f2f7",
          100: "#f1e6f0",
          200: "#dcc0d8",
          300: "#c79ac1",
          400: "#9c4f93",
          500: "#720364",
          600: "#67035a",
          700: "#56024b",
          800: "#44023c",
          900: "#380131",
        },
      },
    },
  },
  plugins: [],
};
