import con from './config';
import ajax from './ajax';
import pako from 'pako';

class Utils {
    constructor(){
      this.addEvent = this._addEvent();
      this.mobile = this._mobile();
    }
    // 获取该页面对应上报数据接口的路径
    getPath () {
      return '/' + con.page + '/bp';
    }
    /**
    * 将json结构转为字符串
    * get 形式的上报会用到
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
    sendRequest (url, data) {
        let zipData;
        if(con.compress){
            zipData = this.zip(JSON.stringify(data));
        } else {
            zipData = JSON.stringify(data);
        }
        if (!this.checkWhiteList()) {
            console.error('域名不在白名单内', '@burying-point');
            return;
        }
        ajax.ajax({
            url,
            type:'post',
            data: {data: zipData, compress: con.compress},
            dataType: 'json',
            timeout:10000,
            contentType: "application/json",
            success: function(){
                // console.log(`上报成功${data}`);
            },
            //异常处理
            error:function(){
                // console.error(`上报失败${e}`);
            }
        })
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
    * 解析data-moni中的数据
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
                ele.attachEvent('on' + type, func); // IE
            };
        } else if (con.doc.addEventListener) {
            return function (ele, type, func) {
                ele.addEventListener(type, func, false);
            };
        }
    }
    /**
     * 获得操作设备
     */
    _mobile () {
        try {
            con.doc.createEvent('TouchEvent');
            return true;
        } catch (e) {
            return false;
        }
    }
    /**
     * 获取xpath
     * 将触发的元素event.target传入，即可得到完整的xpath
     * @param elem 
     */
    xPath(elem){
        if(elem.id != ''){
            return '//*[@id=\"'+elem.id+'\"]';
        }
        if(elem == document.body){
            return '/html/'+elem.tagName.toLowerCase();
        }
        var index = 1,siblings = elem.parentNode.childNodes;
        
        for(var i = 0,len = siblings.length;i<len;i++){
            var sibling = siblings[i];
            if(sibling == elem){
                return this.xPath(elem.parentNode)+'/'+elem.tagName.toLowerCase()+'['+(index)+']';
            }else if(sibling.nodeType==1&&sibling.tagName == elem.tagName){
                index++;
            }
        }
    }

    getStyle(obj) {
        if(obj.currentStyle) {// 兼容IE
          return obj.currentStyle;
        } else { // 兼容火狐谷歌
          return con.win.getComputedStyle(obj, false);
        }
    }
    /**
     * 对字符串进行加密 
     * @param code 
     */
    compileStr(code){       
        var c=String.fromCharCode(code.charCodeAt(0)+code.length);
       for(var i=1;i<code.length;i++)
        {      
         c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
       }   
       return escape(c);   
    }
    /**
     * 字符串进行解密 
     * @param code 
     */
    uncompileStr(code){      
        code=unescape(code);      
        var c=String.fromCharCode(code.charCodeAt(0)-code.length);      
        for(var i=1;i<code.length;i++)
        {      
         c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));      
        }      
        return c;   
    }
    /**
     * 解压
     * @param b64Data 
     */
    unzip(b64Data){
        let strData   = atob(b64Data);
        const charData  = strData.split('').map(function(x){
            return x.charCodeAt(0);
        });
        const binData   = new Uint8Array(charData);
        const data = pako.inflate(binData);
        strData = String.fromCharCode.apply(null, new Uint16Array(data));
        return strData;
    }
    /**
     * 压缩
     * @param str 
     */
    zip(str){
        const binaryString = pako.gzip(str, { to: 'string' })
        return btoa(binaryString);
    }

    isObject(what) {
        return typeof what === 'object' && what !== null;
    }
    formatMs(timeGap){
        if ( typeof(timeGap) !== 'number' ){
            return
        }
        if (timeGap > 1000 ){
            return (timeGap/1000).toFixed(2) + 's'
        }
        return Math.round(timeGap) + 'ms'
    }
    isImg(name){  
        if (/\.(gif|jpg|jpeg|png|webp)/i.test(name)) {  
            return true;  
        }  
        return false;  
    }
    isJs(name){  
        if (/\.(js)/i.test(name)) {  
            return true;  
        }  
        return false;  
    }
    isCss(name){  
        if (/\.(css)/i.test(name)) {  
            return true;  
        }  
        return false;  
    }
    isVideo(name){  
        if (/\.(mp4|rm|rmvb|mkv|avi|flv|ogv|webm)/i.test(name)) {  
            return true;  
        }  
        return false;  
    }
    isFonts(name){  
        if (/\.(woff2?|eot|ttf|otf)/i.test(name)) {  
            return true;  
        }  
        return false;  
    }
    checkResourceType(name){
        if (/\.(gif|jpg|jpeg|png|webp|svg)/i.test(name)) {  
            return 'image';  
        }
        if (/\.(js)/i.test(name)) {  
            return 'javascript';  
        }
        if (/\.(css)/i.test(name)) {  
            return 'css';  
        }  
        if (/\.(mp4|rm|rmvb|mkv|avi|flv|ogv|webm)/i.test(name)) {  
            return 'video';  
        } 
        if (/\.(woff2?|eot|ttf|otf)/i.test(name)) {  
            return 'fonts';  
        } 
        return 'other'
    }
    trim(str){ //删除左右两端的空格
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
}

export default new Utils();