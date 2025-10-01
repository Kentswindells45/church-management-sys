// CommonJS PostCSS config — compatible with "type":"module"
module.exports = {
  plugins: [
    require('postcss-nesting')(),        // safe nesting support
    require('@tailwindcss/postcss')(),  // Tailwind PostCSS adapter (required)
    require('autoprefixer')(),
  ],
};