export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          800: "#133D32",
          900: "#0D332A",
          950: "#08241D",
        },
        cream: {
          50: "#FAF9F5",
          100: "#F4F3ED",
          200: "#EAE8DF",
          300: "#DEDBCF",
        },
        ink: "#1E293B",
      },
      fontFamily: {
        serif: ["'Newsreader'", "Georgia", "serif"],
        sans: ["'Noto Sans'", "'Noto Sans Devanagari'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
