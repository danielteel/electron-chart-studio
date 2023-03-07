const path = require('path');

const moduleConfig= {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [[
            '@babel/preset-env', {
              targets: {
                esmodules: true
              }
            }],
            '@babel/preset-react']
        }
      }
    },
    {
      test: [/\.s[ac]ss$/i, /\.css$/i],
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
      ],
    }
  ]
};

const commonConfig = {
  module: moduleConfig,
  mode: 'development',
  target: 'electron-renderer',
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.js'],
  },
}


module.exports = [
    //App
    {
        ...commonConfig,
        entry: './src/index.js',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'build'),
        }
    }
];