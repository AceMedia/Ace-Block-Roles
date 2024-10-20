const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    'block-roles': './src/js/block-roles.js',          // JavaScript entry
    'style-block-roles': './src/scss/style-block-roles.scss' // SCSS entry
  },
  output: {
    filename: 'js/[name].min.js',
    path: path.resolve(__dirname, 'build'),
    clean: false
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'uglify-loader' // Minify JS files
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].min.css', // Output CSS correctly
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()], // Minimize JS files
  },
  mode: 'production',
};
