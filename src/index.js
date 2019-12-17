import utils from './utils';
import con from './config';
import BP from './bp';
import EP from './ep';
import ticker from './ticker';
import PerConstructor from './performance';

export default function BuryingPoint(opt) {
    /**
    * 初始化参数
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
    */
    console.log('============ Monitor 初始化开始 ============ ');
    const options = Object.assign({//合并参数
        bury: 3,
        level: '1',
        per: false,
        jsErr: false,
        appId: '',
        appName: '',
        compress: true,
        baseUrl: con.win.location.href,
        sendTimeGap: 5000,
        stay: false,
        manual: false
    }, opt);

    if(options.appId === '' || options.appName === ''){
        console.error('埋点启动失败，请正确配置appId或者appName！');
        return {};
    }
    if(options.sendTimeGap < 5000 || typeof options.sendTimeGap !== 'number'){
        console.log('启动定时上报失败，请正确配置sendTimeGap！sendTimeGap不得小于5000且必须是数字类型');
    }

    // 初始化配置参数
    (function(){
        con.stayTime = options.sendTimeGap;
        con.baseUrl = options.baseUrl;
        con.compress = options.compress;
        EP.appId = options.appId; 
        EP.appName = options.appName; 
    })();

    for (let i in options){
        console.log(`${i}：${options[i]|| '未设置'}`); 
    }
    
    // 前端错误上报
    if(options.jsErr) {
        window.onerror = function(msg, url, line, col, error) {
            let errobj = {
                msg: `错误：${msg}`,
                url: `URL：${url}`,
                line: `行：${line}`,
                col: `列：${col}`,
                error: `错误对象：${error}`
            };
            BP.pushQueueData('error', { jsErr: errobj, err: '前端错误上报' });
        }
    }

    // 代码埋点，声明试埋点
    const buryingPoint = function () {
        let attr = 'data-moni';
        let evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            let target =  evt.srcElement || evt.target;
            while (target && target.parentNode) { // 找到最近手动埋的节点
                if (target.hasAttribute(attr)) {
                    let metadata = target.getAttribute(attr);
                    let data = utils.parse(metadata);
                    if (target.nodeName.toLowerCase() === 'a') {
                        data.href = encodeURIComponent(target.href);
                    }
                    const lev = options.level === data.level || !data.level; // 判断dom上的监控级别是否和初始化设置的一样
                    if (data.evt && lev) {
                        let event = data.evt;
                        delete data.evt;
                        let html = target.innerHTML || target.value; // input元素取value
                        BP.pushQueueData(event, {html: utils.trim(`${html}`), ...data}, target);
                    }
                    break;
                }
                target = target.parentNode;
            }
            if(target === document && options.bury === 3){ // 没有绑定属性
                let t =  evt.srcElement || evt.target;
                let html = t.innerHTML || t.value; // input元素取value;
                BP.pushQueueData('click', { html: utils.trim(`${html}`) }, t);
            }
        });
    };


    //无埋点或者说是全埋点
    const noBuryingPoint = function(){
        let evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            let target = evt.srcElement || evt.target;
            let data = target.innerHTML;
            BP.pushQueueData('click', { html: data }, target);
        });
    }
    
  
    /**
     * Ticker钩子函数，用于上报页面停留时长
     * @param dt 间隔时间
     */
    const calStayTime = function (dt) {
        con.totalTime += dt;
        if(con.totalTime >= con.stayTime) {
            if(options.stay) {
                BP.pushQueueData('stay', { time: con.stayTime });
            }
            BP.send();
            con.totalTime -= con.stayTime;
        }
    };
    
    /**
     * 启动埋点
     */
    const start = function () {
        // 绑定dom事件
        if(options.bury === 1){
            noBuryingPoint();
        }else if(options.bury === 2 || options.bury === 3){
            buryingPoint();
        } else {
            console.error('请正确配置bury参数，无埋点=>1，声明式埋点=>2，两种都支持=>3');
        }
        // 事件轮询系统
        if(options.sendTimeGap >= 5000){
            // 启动ticker（也就是定时上报）
            ticker.start();
            ticker.register(calStayTime);
            // 页面离开时不再计时
            utils.addEvent(con.doc, 'visibilitychange', function () {
                if (con.doc.visibilityState === 'hidden') {
                    ticker.stop();
                } else {
                    ticker.start();
                }
            });
        } 
        
        // 监测一次性能监控
        if(options.per){  
            const Per = new PerConstructor();
            Per.start('pushQueueData');
        }  
        // 上报pv，打开页面执行，只执行一次
        BP.sendPV();
    };
    
    
    function winStart () {
        if (!utils.checkWhiteList()) {
            console.error('域名不在白名单内', '@zui-monitor');
            return;
        }
        console.log('============ Monitor 初始化成功 ============ ');
        setTimeout(()=>{
            start();
        }, 20); 
    }
    if(options.manual){
        // 将start绑定到BP上，兼容老项目
        BP.start = winStart;
    } else {
        // 侦听load事件，准备启动数据上报
        utils.addEvent(con.win, 'load', winStart);
    }
    return BP;
}