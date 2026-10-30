export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2a24",
        leaf: { 50: "#f1f8f4", 100: "#dcefe3", 200: "#b8dfca", 300: "#8bcaaa", 500: "#2f855a", 600: "#276749", 700: "#1f5238" },
        saffron: { 100: "#fdf0d5", 200: "#fbe0a8", 500: "#d98a1c", 700: "#8a5610" },
      },
      fontFamily: {
        sans: ["'Noto Sans'", "'Noto Sans Devanagari'", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
