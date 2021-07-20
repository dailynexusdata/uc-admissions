const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "production",

  output: {
    filename: "uc-admissions-bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
