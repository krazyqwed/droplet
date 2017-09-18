import Timer from './Timer'; 

class Wait {
  constructor() {
    this._options = false;

    this._timer = new Timer();
    this._timer.addEvent('wait', {
      callback: this._waitEvent.bind(this),
      useMillisec: true
    });
  }

  handleAction(options) {
    this._options = options;

    if (!this._options.event) {
      this._options.event = 'wait';
    }

    this['_' + this._options.event + 'Action']();
  }

  _waitAction() {
    this._timer.setRunLimit('wait', this._options.duration ? this._options.duration : 1000);
    this._timer.start('wait');
  }

  _waitEvent(event) {
    if (event.over) {
      this._timer.destroy('wait');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }
}

export default new Wait();
