import CommonHelper from '../helpers/Common';

class Alert {
  constructor() {
    this._dom = {};
    this._dom.alert = document.querySelector('.js_alert');
    this._dom.desc = document.querySelector('.js_alert_desc');
    this._dom.confirm = document.querySelector('.js_alert_confirm');
    this._dom.cancel = document.querySelector('.js_alert_cancel');
    this._dom.confirm.addEventListener('mousedown', this._confirm.bind(this));
    this._dom.cancel.addEventListener('mousedown', this._cancel.bind(this));
    this._events = {};
    this._events.keyboard = this._keyboardEvent.bind(this);
  }

  show(options) {
    D.EngineStore.setData('alertOpen', true);

    this._dom.desc.innerHTML = options.description;
    this._dom.cancel.textContent = options.cancel;
    this._dom.confirm.textContent = options.confirm;

    this._dom.alert.style.removeProperty('display');

    requestAnimationFrame(() => {
      this._dom.alert.classList.add('d_alert-wrap--visible');

      window.addEventListener('keydown', this._events.keyboard);
    });
  }

  hide() {
    D.EngineStore.setData('alertOpen', false);

    this._dom.alert.classList.remove('d_alert-wrap--visible');

    window.removeEventListener('keydown', this._events.keyboard);

    CommonHelper.requestTimeout(() => {
      this._dom.alert.style.display = 'none';
    }, 300);
  }

  _confirm() {
    D.EngineStore.setData('alertAnswer', true);
  }

  _cancel() {
    D.EngineStore.setData('alertAnswer', false);
  }

  _keyboardEvent(event) {
    if (event.which === 27) {
      event.preventDefault();
      this._cancel();
    }
  }
}

export default new Alert();
