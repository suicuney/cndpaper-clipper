const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const packageJson = require('./package.json');

module.exports = (_env, argv) => {
  const production = argv.mode === 'production';

  return {
    mode: argv.mode,
    entry: {
      popup: './src/popup.ts',
      options: './src/options.ts',
      extractor: './src/extractor.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    optimization: {
      minimize: production,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              ascii_only: true,
            },
          },
        }),
      ],
    },
    performance: { hints: false },
    devtool: production ? false : 'source-map',
    resolve: { extensions: ['.ts', '.js'] },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/manifest.json', to: 'manifest.json' },
          { from: 'src/popup.html', to: 'popup.html' },
          { from: 'src/options.html', to: 'options.html' },
          { from: 'src/styles.css', to: 'styles.css' },
          { from: 'src/icons', to: 'icons' },
        ],
      }),
      ...(production
        ? [
            new ZipPlugin({
              path: path.resolve(__dirname, 'builds'),
              filename: `cndpaper-web-clipper-${packageJson.version}-chrome.zip`,
            }),
          ]
        : []),
    ],
  };
};
