const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, "src/main"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: 'dist/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.png'],
  },
  devtool: 'source-map',
  devServer: {
    port: process.env.PORT || 3000,
    overlay: true,
    
    hot: true,
    host: "0.0.0.0",
    allowedHosts: [
      ".repl.it",
      ".repl.co",
      ".repl.run"
    ]
  },
  mode: "none",
};