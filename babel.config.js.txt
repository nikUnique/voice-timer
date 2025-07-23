module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  env: {
    production: {
      plugins: ["transform-remove-console"],
    },
  },
};
