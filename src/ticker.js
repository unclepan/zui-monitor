class Ticker {
  constructor() {
    this.tid = 0;
    this.lastTime =  0;
    this.funcs = [];
  }
  /**
   * 启动
   */
  start () {
      if(this.tid > 0) {
          return;
      }
      this.lastTime = 0;
      this.tid = setInterval(() => {
          var time = new Date().getTime();
          if(this.lastTime > 0) {
              var delay = time - this.lastTime;
              for (var i = 0; i < this.funcs.length; i++) {
                this.funcs[i].func(delay);
              }
          }
          this.lastTime = time;
      }, 33);
  }
  /**
   * 停止
   */
  stop () {
      clearInterval(this.tid);
      this.tid = 0;
  }
  /**
   * 注册钩子函数
   * @param func 方法
   */
  register (func) {
    this.funcs.push({ 'func': func });
  }
  /**
   * 删除钩子函数
   * @param func 方法
   */
  unregister (func) {
      for (var i = 0; i < this.funcs.length; i++) {
          if(func === this.funcs[i].func) {
            this.funcs.splice(i, 1);
          }
      }
  }
}

export default new Ticker();