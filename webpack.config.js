/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const debug = process.env.NODE_ENV !== 'production';

module.exports = {
    devtool: debug ? 'source-map' : 'cheap-module-eval-source-map',
    entry: ['./src/index.js'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'zui-monitor-[name].min.js', // 表示打包出来文件名叫什么
      libraryExport: "default", // 表示打包出来的变量直接对外暴露 default 属性，否则我们调用的时候需要 new BuryingPoint.default()，这不是我们希望的调用方式
      library: 'ZuiMonitor', // 表示对外暴露的变量叫什么
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
}