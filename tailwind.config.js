module.exports = {
  purge: {
    content: ["./dist/*.html"],
    options: {
      keyframes: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: (theme) => ({
        hero: "url('/assets/images/banner.jpg')",
      }),
      borderRadius: {
        large: "10rem",
      },
      borderWidth: {
        large: "30px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
