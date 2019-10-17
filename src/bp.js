import UUID from 'uuid-js';
import utils from './utils';
import con from './config';
import CI from './ci';
import EP from './ep';

// 暴露给全局调用的
class BP {
    constructor(){
        this.sessionId = this._sessionId();
        this.deviceId = this._deviceId();
    }
    // 会话id，刷新页面会更新
    _sessionId () {
      return UUID.create();
    }
    // 设备id，读取cookie，不存在则种入cookie
    _deviceId () {
        var did = utils.getCookie(con.cookieName);
        if (!did) {
            did = UUID.create();
            utils.setCookie(con.cookieName, did, con.year);
        }
        return did;
    }
    // 获取基础数据，包括浏览器数据，时间戳
    getData () {
        var arr = con.win.location.href.split('//');
        var source = arr.length > 1 ? arr[1] : arr[0];

        return {
            ...CI,
            ...EP,
            t: new Date().getTime(),
            href: encodeURIComponent(utils.stringSplice(source, 'href', '?', '')),
            ref: encodeURIComponent(utils.stringSplice(con.doc.referrer, 'ref', '?', '')),
            sessionId: this.sessionId,
            deviceId: this.deviceId
        };
    }
    // 上报pv
    sendPV () {
        this.pushQueueData('visit');
        this.send();
    }
    /**
    * 上报数据
    * @param evt 事件
    * @param ext 扩展数据
    */
    //pushQueueData
    pushQueueData (evt, ext = {}, ele) {
        if (evt === '') {
            return;
        }
        if (!(ext instanceof Object)) {
            return;
        }
        let xPath, css;
        if(ele){
            xPath = { xPath: utils.xPath(ele) };
            css = { css: utils.getStyle(ele) };
        }
        console.log(css);
        const obj = {
            evt,
            ...this.getData(),
            ...ext,
            ...xPath,
            // ...css
        }
        con.queueData.push(obj);
    }
    send(){
        utils.sendRequest(con.baseUrl, con.queueData);
        con.queueData = []; // 清空队列数据
    }

    set external(value) {
        EP.setUp(value);
    }
    get external () {
        return EP;
    }
    // 设置白名单
    set whiteList (value) { 
      con.whiteList = value;
    }
    get whiteList () {
        return con.whiteList;
    }
}


export default new BP();