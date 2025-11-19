import path from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// eslint-disable-next-line import/no-extraneous-dependencies
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mode = process.argv.includes('--mode=production') ?
  'production' : 'development';
const libraryName = process.env.npm_package_name;

export default {
  mode: mode,
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/scripts/components'),
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@services': path.resolve(__dirname, 'src/scripts/services'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
  },
  optimization: {
    minimize: mode === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress:{
            drop_console: true,
          }
        }
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${libraryName}.css`
    })
  ],
  entry: {
    dist: './src/entries/dist.js'
  },
  output: {
    filename: `${libraryName}.js`,
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  target: ['browserslist'],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(s[ac]ss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: ''
            }
          },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  stats: {
    colors: true
  },
  ...(mode !== 'production' && { devtool: 'eval-cheap-module-source-map' })
};
