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
    * @param tic 是否启动定时上报
    * @param per 性能监控，默认不监控
    * @param appId 业务系统ID(*必填)
    * @param appName 业务系统NAME(*必填)
    * @param encrypt 上报的信息是否加密(默认加密)
    * @param compress 上报的信息是否压缩(默认压缩)
    * @param baseUrl 监控信息接收的地址
    * @param stayTime 发送监控信息的时间间隔

    */
    const options = Object.assign({//合并参数
        bury: 3,
        level: '1',
        tic: true, 
        per: false,
        appId: '',
        appName: '',
        encrypt: true,
        compress: true,
        baseUrl: con.win.location.href,
        stayTime: 5000
    }, opt);

    if(options.appId === '' || options.appName === ''){
        return console.error('埋点启动失败，请正确配置appId或者appName！');
    }
    // 初始化配置参数
    (function(){
        con.baseUrl = options.baseUrl;
        EP.appId = options.appId; 
        EP.appName = options.appName; 
    })();

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
                    const lev = options.level === data.level || !data.level;
                    if (data.evt && lev) {
                        let event = data.evt;
                        delete data.evt;
                        let html = target.innerHTML;
                        BP.pushQueueData(event, {html, ...data}, target);
                    }
                    break;
                }
                target = target.parentNode;
            }
            if(target === document && options.bury === 3){ // 没有绑定属性
                let t =  evt.srcElement || evt.target;
                let html = t.innerHTML;
                BP.pushQueueData('no', { html }, t);
            }
        });
    };


    //无埋点或者说是全埋点
    const noBuryingPoint = function(){
        let evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            let target = evt.srcElement || evt.target;
            let data = target.innerHTML;
            BP.pushQueueData('no', { html: data }, target);
        });
    }
    
  
    /**
     * Ticker钩子函数，用于上报页面停留时长
     * @param dt 间隔时间
     */
    const calStayTime = function (dt) {
        con.totalTime += dt;
        if(con.totalTime >= con.stayTime) {
            BP.pushQueueData('stay', { time: con.stayTime });
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
        if(options.tic){
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
    
    // 侦听load事件，准备启动数据上报
    utils.addEvent(con.win, 'load', function () {
        if (!utils.checkWhiteList()) {
            console.error('域名不在白名单内', '@uncle-burying-point');
            return;
        }
        console.log('埋点数据即将开始上报数据');
        setTimeout(()=>{
            start();
        }, 0); 
    });

    return BP;
}