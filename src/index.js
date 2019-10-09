import utils from './utils';
import con from './config';
import BP from './bp';
import ticker from './ticker';

export default function BuryingPoint(bury = true, tic = true) {
    // 代码埋点，声明试埋点
    const buryingPoint = function () {
        var attr = 'bp-data';
        var evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            var target = evt.srcElement || evt.target;
            while (target && target.parentNode) { // 找到最近手动埋的节点
                if (target.hasAttribute(attr)) {
                    var metadata = target.getAttribute(attr);
                    var data = utils.parse(metadata);
                    if (target.nodeName.toLowerCase() === 'a') {
                        data.href = encodeURIComponent(target.href);
                    }
                    if (data.evt) {
                        var event = data.evt;
                        delete data.evt;
                        BP.send(event, data, target);
                    }
                    break;
                }
                target = target.parentNode;
            }
        });
    };


    //无埋点或者说是全埋点
    const noBuryingPoint = function(){
        var evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            var target = evt.srcElement || evt.target;
            var data = target.innerHTML;
            BP.send('no', {html: data}, target);
        });
    }
    
  
    /**
     * Ticker钩子函数，用于上报页面停留时长
     * @param dt 间隔时间
     */
    var calStayTime = function (dt) {
        con.totalTime += dt;
        if(con.totalTime >= con.stayTime) {
            BP.send('stay', { time: con.stayTime });
            con.totalTime -= con.stayTime;
        }
    };
    
    /**
     * 启动埋点
     */
    var start = function () {
        if(bury){
            // 绑定声明试埋点
            buryingPoint();
        } else {
            //无埋点，全局埋点
            noBuryingPoint();
        }
        // 上报pv，打开页面执行，只执行一次
        BP.sendPV();
        if(tic){
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
    };
    
    // 侦听load事件，准备启动数据上报
    utils.addEvent(con.win, 'load', function () {
        if (!utils.checkWhiteList()) {
            console.error('域名不在白名单内', '@uncle-burying-point');
            return;
        }
        console.log('埋点数据即将开始上报数据');
        start();
    });
    
    return BP;
}