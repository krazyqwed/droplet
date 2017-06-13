import CommonHelper from '../helpers/Common';
import StringHelper from '../helpers/String';

class Settings {
  constructor() {
    this._dom = {};
    this._dom.wrap = document.querySelector('.js_settings');
    this._dom.content = document.querySelector('.js_settings_content');
    this._dom.back = document.querySelector('.js_settings_back');
    this._dom.back.addEventListener('mousedown', this._hide.bind(this));

    this._events = {};
    this._events.show = this._showEvent.bind(this);
    this._events.transitionEnd = this._transitionEndEvent.bind(this);
  }

  show() {
    this._dom.wrap.style.removeProperty('display');
    this._dom.wrap.offsetHeight;
    this._dom.wrap.removeEventListener('transitionEnd', this._events.transitionEnd);
    this._dom.wrap.classList.add('d_settings-wrap--visible');

    window.addEventListener('keydown', this._events.show);
  }

  _showEvent(event) {
    if (event.which === 27) {
      event.preventDefault();
      this._hide();
    }
  }

  _hide() {
    this._dom.wrap.addEventListener('transitionEnd', this._events.transitionEnd);
    this._dom.wrap.classList.remove('d_settings-wrap--visible');

    window.removeEventListener('keydown', this._events.show);
  }

  _transitionEndEvent() {
    this._dom.wrap.style.display = 'none';
  }
}

export default new Settings();
