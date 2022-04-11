const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    // include only browser/index.js for UMD build
    index: path.resolve(__dirname, "dist", "cjs", "browser", "index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist", "umd"),
    filename: "[name].min.js",
    libraryTarget: "umd",
    library: "KeyValueStorage",
    umdNamedDefine: true,
    globalObject: "this",
  },
};
