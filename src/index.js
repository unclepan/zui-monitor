import utils from './utils';
import con from './config';
import BP from './bp';
import ticker from './ticker';

export default function BuryingPoint() {
    // 代码埋点，声明试埋点
    var buryingPoint = function () {
        var attr = 'bp-data';
        var evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            var target = evt.srcElement || evt.target;
            while (target && target.parentNode) {
                if (target.hasAttribute(attr)) {
                    var metadata = target.getAttribute(attr);
                    var data = utils.parse(metadata);
                    if (target.nodeName.toLowerCase() === 'a') {
                        data.href = encodeURIComponent(target.href);
                    }
                    if (data.evt) {
                        var event = data.evt;
                        delete data.evt;
                        BP.send(event, data);
                    }
                    break;
                }
                target = target.parentNode;
            }
        });
    };
  
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
        buryingPoint();
        
        BP.sendPV();
    
        // 启动ticker
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
    };
    
    // 侦听load事件，准备启动数据上报
    utils.addEvent(con.win, 'load', function () {
        if (!utils.checkWhiteList()) {
            console.error('域名不在白名单内', '@burying-point');
            return;
        }
    
        console.log('即将开始上报数据');
        start();
    });
    
    return BP;
}