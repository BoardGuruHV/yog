/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yoga: {
          50: "#fdf8f6",
          100: "#f9ebe5",
          200: "#f4d5c7",
          300: "#e9b8a0",
          400: "#dc9474",
          500: "#cf7652",
          600: "#b85d3e",
          700: "#994b33",
          800: "#7d3f2e",
          900: "#673729",
          950: "#371a13",
        },
        sage: {
          50: "#f6f7f4",
          100: "#e3e7dd",
          200: "#c7cfbc",
          300: "#a3b192",
          400: "#819470",
          500: "#657856",
          600: "#4f5e44",
          700: "#404b38",
          800: "#353e30",
          900: "#2e352a",
          950: "#171c15",
        },
      },
    },
  },
  plugins: [],
};
