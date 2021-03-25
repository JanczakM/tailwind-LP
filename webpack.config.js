const currentTask = process.env.npm_lifecycle_event; //ustala, czy działa dev czy build
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fse = require("fs-extra");

const postCSSPlugins = [
  require("postcss-import"),
  require("postcss-mixins"),
  require("postcss-simple-vars"),
  require("postcss-hexrgba"),
  require("postcss-nested"),
  require("autoprefixer"),
  require("tailwindcss"),
];

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy images", function () {
      fse.copySync("./app/assets/images", "./dist/assets/images");
    });
  }
}

let cssConfig = {
  test: /\.css$/i, //weź tylko kończące się na .css
  use: [
    "css-loader?url=false",
    { loader: "postcss-loader", options: { plugins: postCSSPlugins } },
  ], //użyj tych paczek. style-loader używa styli a css-loader ładuje je do js.?url=false dotyczy nieobsługiwania urli(np. do obrazków w css)
};

let pages = fse
  .readdirSync("./app")
  .filter(function (file) {
    return file.endsWith(".html");
  })
  .map(function (page) {
    return new HtmlWebpackPlugin({
      filename: page,
      template: `./app/${page}`,
      minify: false, //usunąć to, jeśli html ma być zminifikowany
    });
  });

let config = {
  entry: "./app/js/script.js", //plik wejściowy
  plugins: pages,
  module: {
    rules: [cssConfig],
  },
};

if (currentTask == "dev") {
  cssConfig.use.unshift("style-loader");
  config.output = {
    filename: "bundle.js", //nazwa pliku wyjściowego
    path: path.resolve(__dirname, "app"), //ścieżka do pliku wyjściowego
  };
  config.devServer = {
    before: function (app, server) {
      server._watch("./app/**/*.html"); // by reagował na zmiany w html
    },
    contentBase: path.join(__dirname, "app"), //serwowany folder (ten, w którym jest index.html) np. jeśli jest to folder wewnątrz projektu path.join(__dirname, 'app')
    hot: true, //bez potrzeby wciskania F5
    port: 3000,
    host: "0.0.0.0", //by strona była dostępna na innych urządzeniach. trzeba znaleźć IP i na końcu dodać :3000
    open: true,
  };
  config.mode = "development";
}

if (currentTask == "build") {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
      },
    },
  });
  cssConfig.use.unshift(MiniCssExtractPlugin.loader);
  postCSSPlugins.push(require("cssnano"));
  config.output = {
    filename: "[name].[chunkhash].js", //nazwa pliku wyjściowego. Hash zmienia się tylko gdy w pliku się coś zmieniło
    chunkFilename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist"), //ścieżka do pliku wyjściowego
  };
  config.mode = "production";
  config.optimization = {
    splitChunks: { chunks: "all" },
  };
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "styles.[chunkhash].css" }),
    new RunAfterCompile()
  );
}

module.exports = config;
