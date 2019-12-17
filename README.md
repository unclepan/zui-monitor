# zui-monitor

## 项目简介
- 前端监控方案
- 可监控三类信息：行为监控，性能监控，页面错误监控。
- 按信息分类分成五类上报的事件类型，行为监控包含：点击事件（click），页面进入事件（stay），页面关闭事件（close）。性能监控包含：监控事件（per）。页面错误包含：错误（error）。
- 不依赖开发形式与框架 。

开发
```shell
$ npm install
$ npm run dev
```
## 安装

In a browser:
```html
<script src="zui-monitor-main.min.js"></script>

<script>
  var buryingPoint = ZuiMonitor({
      per: true,
      jsErr: false,
      appId: '12345',
      appName: '测试系统',
      level: '1',
      baseUrl: 'http://10.200.82.24:80/workflow/fronted/ui/log/upload',
      compress: false
  });
  // 追加外部参数
  buryingPoint.external = {userId: 'yangpan', appId:'123'};
  // 或者追加用户信息
  bp.user = {
      yagpan: 1234,
      lihai: '瞎写的',
      userId: '12324',
      userOrg: 14,
      userExt: {
          a: 1111,
          b: 2222
      }
  };
</script>
```

or npm:
```shell
$ npm i -g npm
$ npm i zui-monitor
```
```html
import bp from 'zui-monitor';

const buryingPoint = bp({
  per: true,
  jsErr: true,
  appId: '12345',
  appName: '测试系统',
  level: '1',
  tic: true
});
// 追加外部参数
buryingPoint.external = {userId: 'yangpan', appId: '123', workflow: 'test'};

// 开启白名单
buryingPoint.whiteList.push('0.0.0.0');
```

Note: add --save if you are using npm < 5.0.0

## 说明
- 初始化参数
```
* @param bury 监控模式（无埋点=>1，声明式埋点=>2，两种都支持=>3）
* @param level 监控级别（默认为1）
* @param per 性能监控，默认不监控
* @param jsErr js错误监控
* @param appId 业务系统ID(*必填)
* @param appName 业务系统NAME(*必填)
* @param compress 上报的信息是否压缩(默认压缩，生产环境必须设置为true)
* @param baseUrl 监控信息接收的地址
* @param sendTimeGap 发送监控信息的时间间隔大于5000毫秒便启动定时上报
* @param stay 是否上报页面停留数据
* @param manual 手动调用方法
  ```

上报的五种json格式
- 页面统计pv的json
```
{
  "evt": "visit",
  "os": "Mac%20OS%20X_10.12.6",
  "browser": "Chrome_77.0.3865.120",
  "engine": "Webkit_537.36",
  "lbs": {
  "longtitude": "116.310807",
  "latitude": "39.982365",
  "channelType": "00"
  },
  "appId": "12345",
  "appName": "测试系统",
  "userId": "yangpan",
  "t": 1571643169865,
  "href": "localhost%3A9090%2F",
  "ref": "http%3A%2F%2Flocalhost%3A9090%2F",
  "sessionId": "622d945d-b334-46f5-9f35-af04cf0c28ba",
  "deviceId": "bp_did=db12aa70-08a6-4088-8ed3-b87b9ed144c9"
}
```

- 开启前端资源加载性能的json
```
{
  "evt": "per",
  "os": "Mac%20OS%20X_10.12.6",
  "browser": "Chrome_77.0.3865.120",
  "engine": "Webkit_537.36",
  "lbs": {
  "longtitude": "116.310807",
  "latitude": "39.982365",
  "channelType": "00"
  },
  "appId": "12345",
  "appName": "测试系统",
  "userId": "yangpan",
  "t": 1571643169865,
  "href": "localhost%3A9090%2F",
  "ref": "http%3A%2F%2Flocalhost%3A9090%2F",
  "sessionId": "622d945d-b334-46f5-9f35-af04cf0c28ba",
  "deviceId": "bp_did=db12aa70-08a6-4088-8ed3-b87b9ed144c9",
  "DNS查询耗时": "0ms",
  "TCP链接耗时": "0ms",
  "request请求耗时": "5ms",
  "解析dom树耗时": "81ms",
  "白屏时间": "7ms",
  "domready时间(用户可操作时间节点)": "269ms",
  "onload时间(总下载时间)": "350ms",
  "js": [
  {
  "资源名称": "http://localhost:9090/main.min.js?5fce9eb9395a8a06f825",
  "HTTP协议类型": "http/1.1",
  "TCP链接耗时": "0ms",
  "加载时间": "55ms"
  }
  ],
  "css": [],
  "image": [],
  "video": [],
  "fonts": [],
  "others": [],
  "pre": "性能监控"
}
```

-  监控到js报错的json
```
{
  "evt": "error",
  "os": "Mac%20OS%20X_10.12.6",
  "browser": "Chrome_77.0.3865.120",
  "engine": "Webkit_537.36",
  "appId": "12345",
  "appName": "测试系统",
  "userId": "yangpan",
  "t": 1571643169776,
  "href": "localhost%3A9090%2F",
  "ref": "http%3A%2F%2Flocalhost%3A9090%2F",
  "sessionId": "622d945d-b334-46f5-9f35-af04cf0c28ba",
  "deviceId": "bp_did=db12aa70-08a6-4088-8ed3-b87b9ed144c9",
  "jsErr": {
  "msg": "错误：Uncaught ReferenceError: Name is not defined",
  "url": "URL：http://localhost:9090/",
  "line": "行：42",
  "col": "列：32",
  "error": "错误对象：ReferenceError: Name is not defined"
  },
  "err": "前端错误上报"
}
```

- 页面点击交互的json
```
{
  "evt": "click",
  "os": "Mac%20OS%20X_10.12.6",
  "browser": "Chrome_77.0.3865.120",
  "engine": "Webkit_537.36",
  "lbs": {
  "longtitude": "116.310807",
  "latitude": "39.982365",
  "channelType": "00"
  },
  "appId": "12345",
  "appName": "测试系统",
  "userId": "yangpan",
  "t": 1571643171937,
  "href": "localhost%3A9090%2F",
  "ref": "http%3A%2F%2Flocalhost%3A9090%2F",
  "sessionId": "622d945d-b334-46f5-9f35-af04cf0c28ba",
  "deviceId": "bp_did=db12aa70-08a6-4088-8ed3-b87b9ed144c9",
  "html": "无埋点测试",
  "xPath": "/html/body/div[1]/div[2]/div[1]"
}
```

- 每隔一个时间段上报的json(用来计算页面停留时长等)
```
{
  "evt": "stay",
  "os": "Mac%20OS%20X_10.12.6",
  "browser": "Chrome_77.0.3865.120",
  "engine": "Webkit_537.36",
  "lbs": {
  "longtitude": "116.310807",
  "latitude": "39.982365",
  "channelType": "00"
  },
  "appId": "12345",
  "appName": "测试系统",
  "userId": "yangpan",
  "t": 1571643174917,
  "href": "localhost%3A9090%2F",
  "ref": "http%3A%2F%2Flocalhost%3A9090%2F",
  "sessionId": "622d945d-b334-46f5-9f35-af04cf0c28ba",
  "deviceId": "bp_did=db12aa70-08a6-4088-8ed3-b87b9ed144c9",
  "time": 5000
}
```


## 开发目录结构说明
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

![avatar](https://raw.githubusercontent.com/unclepan/zui-monitor/dev/src/images/re.png)

## 开发CLI命令(npm scripts)
| 命令            | 作用&效果          |
| --------------- | ------------- |
| npm run build   | 编译出一份生产环境的代码 |
| npm run dev     | 开启webpack-dev-server并自动打开浏览器，自动监测源码变动并实现Hot Module Replacement，**推荐实际开发时使用此项** |
| npm run stats   | 在根目录生成stats.json得到项目依赖的统计信息，可视化工具：http://webpack.github.io/analyse/ 或者 https://chrisbateman.github.io/webpack-visualizer/ 或者 https://alexkuz.github.io/webpack-chart/ 或者 自行谷歌。当你优化包输出的大小，这些工具是非常重要的。官方工具有很多的功能，但即使是简单的可视化也可以揭示问题点。|

## 更新日志
```
2019-10-25 1: 增加input元素type属性为submit的值获取。2: 元素获取值做trim处理。 3: 增加页面title获取
2019-12-11 1: 增加初始化log。2: 设备信息获取兼容云办公ios封装的浏览器
2019-12-13 1: 增加初始化关键参数stay 当设置为false时，只会收集页面行为的数据，如用户与页面长时间不进行交互，不会上报数据。 但是当需要统计页面停留时长建议打开。
2019-12-17 1: stay默认设置为false。 2: 增加手动启动埋点的方法，配合manual使用
```

## 注意事项
本项目基于`webpack4`版本。

## 当前版本
版本号为0.0.33
