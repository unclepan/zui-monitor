/**
  前端性能监控方案
*/

import utils from './utils';
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
        enteriesResouceDataTiming:{
          "js": 0,
          "css": 0,
          "image": 0,
          "video": 0,
          "others": 0
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
      if(isShow == 'console'){
        this._show()
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
      this.timing = window.performance.timing;
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
    _setEnteries(enteriesResouceData){
      var _imageRes = [];
      var _jsRes = [];
      var _cssRes = [];
      var _vRes = [];
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
        "others": _othRes
      }
    }
}


export default new Per();