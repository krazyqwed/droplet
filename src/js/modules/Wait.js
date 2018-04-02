import Timer from './Timer'; 

class Wait {
  constructor() {
    this._options = false;

    this._timer = new Timer();
    this._timer.addEvent('wait', { onTick: this._waitEvent.bind(this) });
  }

  handleAction(options) {
    this._options = options;

    if (!this._options.event) {
      this._options.event = 'wait';
    }

    this['_' + this._options.event + 'Action']();
  }

  forceEnd() {
    this._timer.endEvent('wait');
  }

  _waitAction() {
    this._timer.setEventOptions('wait', { tickLimit: this._options.duration ? this._options.duration : 1000 });
    this._timer.startEvent('wait');
  }

  _waitEvent(state) {
    if (state.over) {
      D.SceneStore.triggerCallback('autoContinue');
    }
  }
}

export default new Wait();
