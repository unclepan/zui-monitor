import con from './config';

class Utils {
    constructor(){
      this.addEvent = this._addEvent()
      this.mobile = this._mobile()
    }
    // 获取该页面对应上报数据接口的路径
    getPath () {
      return '/' + con.page + '/bp';
    }
    /**
    * 将json结构转为字符串
    * @param json 数据对象
    */
    json2Query (json) {
        var query = '';
        for (var i in json) {
            if (Object.prototype.hasOwnProperty.call(json, i)) {
                query += i + '=' + json[i] + '&';
            }
        }
        return query.substr(0, query.length - 1);
    }
    /**
    * 截取字符串
    * @param str 目标字符串
    * @param start 起始字符串
    * @param end 截取到的字符
    */
    stringSplice (str, start, end, pass) {
        if (str === '') {
            return '';
        }
        pass = pass === '' ? '=' : pass;
        start += pass;
        var ps = str.indexOf(start);
        ps = ps > 0 ? ps + start.length : 0;
        var pe = str.indexOf(end, ps);
        pe = pe > 0 ? pe : str.length;
        return str.substring(ps, pe);
    }
    /**
    * 白名单校验
    */
    checkWhiteList () {
        if (con.whiteList.length === 0) {
            return true;
        }
        var href = con.win.location.href;
        var flag = false;
        for (var i = 0; i < con.whiteList.length; i++) {
            if (href.indexOf(con.whiteList[i]) > -1) {
                flag = true;
                break;
            }
        }
        return flag;
    }
    /**
    * 发送请求，使用image标签跨域
    * @param url 接口地址
    */
    sendRequest (url) {
        if (!this.checkWhiteList()) {
            console.error('域名不在白名单内', '@burying-point');
            return;
        }
        if (con.page.length === 0) {
            console.error('请配置有效的page参数', '@burying-point');
            return;
        }
        var img = new Image();
        img.src = url;
    }
    /**
    * 设置cookie
    * @param name 名称
    * @param value 值
    * @param days 保存时间
    * @param domain 域
    */
    setCookie (name, value, days, domain) {
        if (value === null) {
            return;
        }
        if (domain === undefined || domain === null) {
            // 去除host中的端口部分
            domain = this.stringSplice(con.win.location.host, 'host', ':', '');
        }
        if (days === undefined || days === null || days === '') {
          con.doc.cookie = name + '=' + value + ';domain=' + domain + ';path=/';
        } else {
            var now = new Date();
            var time = now.getTime() + con.DAY * days;
            now.setTime(time);
            con.doc.cookie = name + '=' + value + ';domain=' + domain + ';expires=' + now.toUTCString() + ';path/';
        }
    }
    /**
    * 读取cookie
    * @param name 名称
    */
    getCookie (name) {
        if (name === undefined || name === null) {
            return;
        }
        var reg = RegExp(name);
        if (reg.test(con.doc.cookie)) {
            return this.stringSplice(con.doc.cookie, name, ';', '');
        }
    }
    /**
    * 解析bp-data中的数据
    * @param datastr 
    */
    parse (datastr) {
        var data = {};
        // 消除空格
        datastr = datastr.replace(/\s/g, '');
        datastr = datastr.substr(1, datastr.length - 2);
        var objarr = datastr.split(',');
        for (var i = 0; i < objarr.length; i++) {
            var arr = objarr[i].split(':');
            data[arr[0]] = arr[1];
        }
        return data;
    }
    /**
    * 跨浏览器事件侦听
    */
    _addEvent () {
        if (con.doc.attachEvent) {
            return function (ele, type, func) {
                ele.attachEvent('on' + type, func);
            };
        } else if (con.doc.addEventListener) {
            return function (ele, type, func) {
                ele.addEventListener(type, func, false);
            };
        }
    }

    _mobile () {
        try {
          con.doc.createEvent('TouchEvent');
            return true;
        } catch (e) {
            return false;
        }
    }
}


export default new Utils();