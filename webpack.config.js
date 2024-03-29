const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const mode = "development";
let isProd = false;

// relevant for later
if (mode == "production") {
  isProd = true;
}

let ooptimization;

if (isProd) {
  ooptimizaiton = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        terserOptions: {
          mangle: true,
          output: { comments: false },
        },
        extractComments: false,
      }),
    ],
  };
} else {
  ooptimization = {
    minimize: false,
  };
}

module.exports = {
  mode: mode,
  entry: path.join(__dirname, "src", "index.ts"),
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, "src", "assets"),
          to: "assets",
        },
      ],
    }),
    new HTMLWebpackPlugin({
      template: "src/index.html",
      filename: "index.html",
      favicon: "src/assets/favicon.ico",
    }),
    new HTMLWebpackPlugin({
      template: "src/settings.html",
      filename: "settings.html",
      favicon: "src/assets/favicon.ico",
    }),
    new HTMLWebpackPlugin({
      template: "src/header.html",
      filename: "header.html",
    }),
    new HTMLWebpackPlugin({
      template: "src/index.css",
      filename: "index.css",
    }),
  ],
  optimization: ooptimization,
  output: {
    path: path.resolve(__dirname, "www"),
    publicPath: "/",
    filename: "bundle.js",
    chunkFilename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devtool: isProd ? false : "source-map", // only generate source maps in development mode
  devServer: {
    contentBase: path.join("./www/"),
    historyApiFallback: true,
    inline: true,
    host: "0.0.0.0",
    port: 8080,
    compress: true,
    disableHostCheck: true,
  },
};
