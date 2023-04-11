const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const GenerateFontsPlugin = require("./src/plugin");
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin");

const config = (env, argv, customConfig) => {
  return {
    target: "web",
    entry: { demo: "./demo/index.js" },
    output: {
      filename: "[name].[contenthash].js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    // loader都放在module做設定，且不需用require的方式引入（所以loader只要安裝就有效果）
    module: {
      rules: [
        {
          test: /\.svg$/i,
          include: /.*_sprites\.svg$/,
          use: [
            {
              loader: "svg-sprite-loader",
              options: { publicPath: "", symbolId: "good_icon" },
            },
          ],
        },
        {
          test: /\.(scss|sass)$/,
          // 使用sass-loader處理scss與sass檔案，且需要先使用sass-loader處理後，再使用css-loader及壓縮css，處理順序為陣列由後至前
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.css$/,
          // use放入要使用的loader們，順序就是處理的順序
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        { test: /\.(png|gif|jpg)$/, use: ["file-loader"] },
      ],
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      port: "8688",
    },
    // plugin啟用使用new的方式引入模組，並傳入設定值
    plugins: [
      new HtmlWebpackPlugin({
        title: "iconfonts Demo",
        template: "./demo/template/index.html",
      }),
      new MiniCssExtractPlugin(),
      new GenerateFontsPlugin({
        PREFIX: "good_fonts",
        ICON_WITHOUT_COLOR_DIR: "assets/icons/pure",
        ICON_WITH_COLOR_DIR: "assets/icons/color",
        TARGET_CSS_DIR: "assets/css/font",
        TARGET_FONTS_DIR: "assets/assets/fonts",
        TARGET_SPRITE_DIR: "assets/images/sprites",
        FONT_NAME: "good_fonts",
        CSS_CLASS_NAME: "good_icon",
        CSS_TEMPLATE_NAME: "_icons.scss",
        CSS_FILE_NAME: "good_icon.scss",
        DEFAULT_FOLDER_NAME: "G_G_Fonts",
        demo: true,
      }),
      new SpriteLoaderPlugin(),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          common: {
            test: /[\\/]node_modules[\\/]/,
            chunks: "all",
            name: "chunk-vendors",
          },
        },
      },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          exclude: /node_modules/,
          terserOptions: { compress: { drop_console: env.NODE_ENV !== "dev" } },
        }),
      ],
    },
    ...customConfig,
  };
};
module.exports = (env, argv) => {
  const customConfig = {};
  if (env.NODE_ENV == "dev") {
    customConfig.devtool = "source-map";
  }
  return config(env, argv, customConfig);
};
