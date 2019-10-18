# uncle-burying-point

开发
```shell
$ npm install
$ npm run dev
```
## Installation

In a browser:
```html
<script src="lmain.min.js"></script>
```

Using npm:
```shell
$ npm i -g npm
$ npm i uncle-burying-point
```
Note: add --save if you are using npm < 5.0.0

## 项目简介
- 前端监控方案
- 可监控三类信息：行为监控，性能监控，页面错误监控。
- 按信息分类分成五类上报的事件类型，行为监控包含：点击事件（click），页面进入事件（stay），页面关闭事件（close）。性能监控包含：监控事件（per）。页面错误包含：错误（error）。
- 不依赖开发形式与框架 。

## 使用说明

- 初始化参数

```
* @param bury 监控模式（无埋点=>1，声明式埋点=>2，两种都支持=>3）
* @param level 监控级别（默认为1）
* @param tic 是否启动定时上报
* @param per 性能监控，默认不监控
* @param jsErr js错误监控
* @param appId 业务系统ID(*必填)
* @param appName 业务系统NAME(*必填)
* @param encrypt 上报的信息是否加密(默认加密)
* @param compress 上报的信息是否压缩(默认压缩)
* @param baseUrl 监控信息接收的地址
* @param stayTime 发送监控信息的时间间隔
```

## 目录结构说明
```
├─src # 源码开发包
│   ├─ajax.js # 简版ajax请求
│   ├─bp.js # 定义一系列暴露给外部调用方法
│   ├─ci.js # 获取设备信息
│   ├─config.js # 配置参数
│   ├─ep.js # 外部追加参数，只允许定义一次，已追加的属性一旦追加不可更改
│   ├─index.js # 入口启动文件
│   ├─performance.js # 性能监控模块
│   ├─ticker.js # 小型事件轮询系统，监控到上报队列里push进内容，在下一次轮询上报时，一次性上报队列内容
│   └─utils.js # 工具函数
```


## CLI命令(npm scripts)
| 命令            | 作用&效果          |
| --------------- | ------------- |
| npm run build   | 编译出一份生产环境的代码 |
| npm run dev     | 开启webpack-dev-server并自动打开浏览器，自动监测源码变动并实现Hot Module Replacement，**推荐实际开发时使用此项** |
| npm run stats   | 在根目录生成stats.json得到项目依赖的统计信息，可视化工具：http://webpack.github.io/analyse/ 或者 https://chrisbateman.github.io/webpack-visualizer/ 或者 https://alexkuz.github.io/webpack-chart/ 或者 自行谷歌。当你优化包输出的大小，这些工具是非常重要的。官方工具有很多的功能，但即使是简单的可视化也可以揭示问题点。|

## 更新日志
暂无更新
## 注意事项
本项目基于`webpack4`版本。

## 0.0.17
版本号为0.0.17
