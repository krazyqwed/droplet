import CommonHelper from '../helpers/Common';

class Alert {
  constructor() {
    this._events = {};
    this._events.hide = this._hideEvent.bind(this);
  }

  init() {
    D.HTMLState.set('alert.event.confirm', this._confirm.bind(this));
    D.HTMLState.set('alert.event.cancel', this._cancel.bind(this));
  }

  show(options) {
    D.HTMLState.set('alert.visible', true);
    D.HTMLState.set('alert.description', options.description);
    D.HTMLState.set('alert.confirm', options.confirm);
    D.HTMLState.set('alert.cancel', options.cancel);
    D.EngineStore.setData('alertOpen', true);

    window.addEventListener('keydown', this._events.hide);
  }

  hide() {
    D.HTMLState.set('alert.visible', false);
    D.EngineStore.setData('alertOpen', false);

    window.removeEventListener('keydown', this._events.hide);
  }

  _confirm() {
    D.HTMLState.set('alert.visible', false);
    D.EngineStore.setData('alertAnswer', true);
  }

  _cancel() {
    D.HTMLState.set('alert.visible', false);
    D.EngineStore.setData('alertAnswer', false);
  }

  _hideEvent(event) {
    if (event.which === 27) {
      event.preventDefault();
      this._cancel();
    }
  }
}

export default new Alert();
