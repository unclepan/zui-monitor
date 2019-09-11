import UUID from 'uuid-js';
import utils from './utils';
import con from './config';
import CI from './ci';

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
        var ci = utils.json2Query(CI);
        var t = 't=' + new Date().getTime();
        var arr = con.win.location.href.split('//');
        var source = arr.length > 1 ? arr[1] : arr[0];
        // 去除参数
        var href = 'href=' + encodeURIComponent(utils.stringSplice(source, 'href', '?', ''));
        var ref = 'ref=' + encodeURIComponent(utils.stringSplice(con.doc.referrer, 'ref', '?', ''));
        var sid = 'sessionId=' + this.sessionId;
        var did = 'deviceId=' + this.deviceId;
        return ci + '&' + t + '&' + href + '&' + ref + '&' + sid + '&' + did;
    }
    // 上报pv
    sendPV () {
        this.send('visit');
    }
    /**
    * 上报数据
    * @param evt 事件
    * @param ext 扩展数据
    */
    send (evt, ext) {
        if (evt === '') {
            return;
        }
        var extstr = '';
        if (ext) {
            for (var i in ext) {
                if (Object.prototype.hasOwnProperty.call(ext, i)) {
                    extstr += '"' + i + '":"' + ext[i] + '",';
                }
            }
            if (extstr.length > 0) {
                extstr = 'ext={' + extstr.substr(0, extstr.length - 1) + '}';
            }
        }
        var url = con.baseUrl +
            utils.getPath() +
            '?evt=' + evt +
            '&' + this.getData() +
            (extstr.length > 0 ? '&' + extstr : '');
        utils.sendRequest(url);
    }
    set page (value) {
      con.page = value;
    }
    get page () {
        return con.page;
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