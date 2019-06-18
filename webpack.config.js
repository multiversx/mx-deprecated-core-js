const path = require('path');

const include = path.join(__dirname, 'src');

module.exports = {
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "index.js",
    libraryTarget: 'umd',
    library: 'elrondCoreJS',
    globalObject: 'this'
  },
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {test: /\.js$/, loader: 'babel-loader', include},
    ]
  }
};