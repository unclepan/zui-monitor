/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    // entry: ['./src/index.js'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].min.js', // 表示打包出来文件名叫什么
      libraryExport: "default", // 表示打包出来的变量直接对外暴露 default 属性，否则我们调用的时候需要 new BuryingPoint.default()，这不是我们希望的调用方式
      library: 'BuryingPoint', // 表示对外暴露的变量叫什么
      libraryTarget: 'umd' //'this', 'global', 'window'
    },
    module: {
        rules:[{
            test: /\.js?$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader'
        }]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
            template: './index.html',
            title: 'BuringPoint测试',
            hash: true,
            inject: 'head'
      })
    ],
    devServer: {
        contentBase: path.join(__dirname, './dist'),
        open: true,
        port: 9090,
        // proxy: {
        //     '/api/*':{
        //         target: 'http://localhost:8880'
        //     }
        // }
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          include: /\.min\.js$/,
        }),
      ],
    },
}