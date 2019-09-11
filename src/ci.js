import con from './config';

 // 浏览器信息
class CI {
  constructor(){
    this.size = this._size();
    this.network = this._network();
    this.language = this._language();
    this.timezone = this._timezone();
    this.ua = this._ua();
    this.os = this._os();
    this.browser = this._browser();
    this.engine = this._engine();
  }

  _size () {
      return con.scr.width + 'x' + con.scr.height;
    }
  // 网络类型
  _network () {
      return (con.nav.connection && con.nav.connection.type) ? con.nav.connection.type : '-';
  }
  // 语言
  _language () {
      return con.nav.language || '';
  }
  // 时区
  _timezone () {
      return new Date().getTimezoneOffset() / 60 || '';
  }
  _ua () {
      return encodeURIComponent(con.ua);
  }
  _os () {
      var o = con.uaOutput.os;
      return encodeURIComponent(o.name + '_' + o.version.original);
  }
  _browser () {
      var b = con.uaOutput.browser;
      return b.name + '_' + b.version.original;
  }
  _engine () {
      var e = con.uaOutput.engine;
      return e.name + '_' + e.version.original;
  }
}

export default new CI();