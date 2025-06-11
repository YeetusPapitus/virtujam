// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
      sans: ['Inter', 'sans-serif'], // default font family for sans
    },
      colors: {
        primary: "#52A1D2",
      },
    },
  },
  plugins: [],
};
