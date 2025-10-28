const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/code.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: "raw-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "code.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Copy the UI HTML into the dist folder so manifest can point to it
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/ui.html", to: path.resolve(__dirname, "dist", "ui.html") },
      ],
    }),
  ],
};
