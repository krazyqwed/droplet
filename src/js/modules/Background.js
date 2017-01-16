import Timer from './Timer'; 

class Background {
  constructor() {
    this._dom = {};
    this._timer = new Timer();
    //this._timer.addEvent('show', this._blinkEvent.bind(this), 1, true, 60);
    //this._timer.addEvent('hide', this._blinkEvent.bind(this), 1, true, 60);
    //this._timer.addEvent('change', this._blinkEvent.bind(this), 1, true, 60);
  }
}

export default new Background();
