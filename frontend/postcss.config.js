
// frontend/postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // This is correct if @tailwindcss/postcss is in devDependencies
    autoprefixer: {},
  },
};