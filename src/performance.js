/**
  前端性能监控方案
  https://www.cnblogs.com/bldxh/p/6857324.html
  http://www.alloyteam.com/2015/09/explore-performance/comment-page-1/
*/

import utils from './utils';
import BP from './bp';
const {formatMs, isObject, checkResourceType} = utils;

class Per{
    constructor(){
      // 原始timing数据
      this.timing = {};
      // 原始entery数据
      this.enteriesResouceData = [];
      // 存储解析后的数据
      this.data = {
        timingFormat:{},
        enteriesResouceDataFormat:{},
        enteriesResouceDataTiming: {
          "js": 0,
          "css": 0,
          "image": 0,
          "video": 0,
          "fonts": 0,
          "others": 0,
        }
      };
    }
    // 显示数据
    start(isShow) {
      this._init();
      if (!isObject(this.timing)) {
        return;
      }
      this.data.timingFormat = this._setTiming(this.timing);
      this.data.enteriesResouceDataFormat = this._setEnteries(this.enteriesResouceData);
      if(isShow === 'console'){
        this._show()
      }else if(isShow === 'pushQueueData'){
        BP.pushQueueData('per', {...this.data.timingFormat, ...this.data.enteriesResouceDataFormat, pre:'性能监控'});
      }
    }
    _show(){
      console.table(this.data.timingFormat);
      for( var key in this.data.enteriesResouceDataFormat ){
        console.group(key + "--- 共加载时间" + formatMs(this.data.enteriesResouceDataTiming[key]) )
        console.table(this.data.enteriesResouceDataFormat[key] )
        console.groupEnd(key)
      }
    }
    
    // 收集数据
    _init(){
      // 从输入url到用户可以使用页面的全过程时间统计，会返回一个PerformanceTiming对象，单位均为毫秒
      this.timing = window.performance.timing;
      // 获取所有资源请求的时间数据,这个函数返回一个按startTime排序的对象数组，返回值仍是一个数组，这个数组相当于getEntries()方法经过所填参数筛选后的一个子集
      this.enteriesResouceData = window.performance.getEntriesByType('resource')
    }
    _setTiming(timing){
      var data = {
        "DNS查询耗时": formatMs(timing.domainLookupEnd - timing.domainLookupStart),
        "TCP链接耗时" : formatMs(timing.connectEnd - timing.connectStart),
        "request请求耗时" : formatMs(timing.responseEnd - timing.responseStart),
        "解析dom树耗时" : formatMs(timing. domComplete - timing.domInteractive),
        "白屏时间" : formatMs(timing.responseStart - timing.navigationStart),
        "domready时间(用户可操作时间节点)" : formatMs(timing.domContentLoadedEventEnd - timing.navigationStart),
        "onload时间(总下载时间)" : formatMs(timing.loadEventEnd - timing.navigationStart),
      }
      return data
    }
    _setEnteries(enteriesResouceData){ // 资源请求的时间数据
      var _imageRes = [];
      var _jsRes = [];
      var _cssRes = [];
      var _vRes = [];
      var _fRes = [];
      var _othRes = [];
      enteriesResouceData.map(item => {
        var _item = {
          '资源名称': item.name,
          'HTTP协议类型' : item.nextHopProtocol,
          "TCP链接耗时" : formatMs(item.connectEnd - item.connectStart),
          "加载时间" : formatMs(item.duration),
        }
        switch (checkResourceType(item.name)) {
          case 'image':
            this.data.enteriesResouceDataTiming.image += item.duration
            _imageRes.push(_item)
            break;
          case 'javascript':
           this.data.enteriesResouceDataTiming.js += item.duration
            _jsRes.push(_item)
            break;
          case 'css':
            this.data.enteriesResouceDataTiming.css += item.duration
            _cssRes.push(_item)
            break;
          case 'video':
            this.data.enteriesResouceDataTiming.video += item.duration
            _vRes.push(_item)
            break;
          case 'fonts':
              this.data.enteriesResouceDataTiming.fonts += item.duration
              _fRes.push(_item)
              break;
          default:
            this.data.enteriesResouceDataTiming.others += item.duration
            _othRes.push(_item)
            break;
        }
      })
      return {
        "js": _jsRes,
        "css": _cssRes,
        "image": _imageRes,
        "video": _vRes,
        "fonts": _fRes,
        "others": _othRes
      }
    }
}


export default Per;