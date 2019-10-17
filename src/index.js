import utils from './utils';
import con from './config';
import BP from './bp';
import ticker from './ticker';
import _PerConstructor from './performance';

export default function BuryingPoint(opt) {
    /**
    * 初始化参数
    * @param bury 监控模式（无埋点=>1，声明式埋点=>2，两种都支持=>3）
    * @param tic 是否启动定时上报
    * @param per 性能监控，默认不监控
    * @param appId 业务系统ID(*必填)
    * @param appName 业务系统NAME(*必填)
    * @param encrypt 上报的信息是否加密(默认加密)
    * @param compress 上报的信息是否压缩(默认压缩)
    * @param host 监控信息接收的地址
    * @param stayTime 发送监控信息的时间间隔

    */
    const options = Object.assign({//合并参数
        bury: 3,
        tic: true, 
        per: false,
        appId: '',
        appName: '',
        encrypt: true,
        compress: true,
        host: '',
        stayTime: 5000
    }, opt);

    // 代码埋点，声明试埋点
    const buryingPoint = function () {
        var attr = 'data-moni';
        var evtType = utils.mobile ? 'touchstart' : 'mousedown';
        utils.addEvent(con.doc, evtType, function (evt) {
            var target =  evt.srcElement || evt.target;
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
            if(target === document && options.bury === 3){ // 没有绑定属性
                var t =  evt.srcElement || evt.target;
                var html = t.innerHTML;
                BP.send('no', {html}, t);
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
        // 绑定dom事件
        if(options.bury === 1){
            noBuryingPoint();
        }else if(options.bury === 2 || options.bury === 3){
            buryingPoint();
        } else {
            console.log('请正确配置bury参数，无埋点=>1，声明式埋点=>2，两种都支持=>3')
        }
        // 上报pv，打开页面执行，只执行一次
        BP.sendPV();
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
            setTimeout(()=>{
                const _Per = new _PerConstructor();
                _Per.start('console');
            },0); 
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