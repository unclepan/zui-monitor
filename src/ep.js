// 外部扩展参数
class EP {
  constructor(){
    this.appId = '';
    this.appName = '';
  }
  setUp(value = {}){ // 如果已经存在key则不能再设置，否则追加属性，只能设置一次
    for (var i in value) {
      if (Object.prototype.hasOwnProperty.call(value, i) && !Object.prototype.hasOwnProperty.call(this, i)) {
        this[i] = value[i];
      }
    }
  }
}
export default new EP();