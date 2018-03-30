import CommonHelper from '../helpers/Common';
import StringHelper from '../helpers/String';

class Settings {
  constructor() {
    this._events = {};
    this._events.hide = this._hideEvent.bind(this);
  }

  init() {
    D.HTMLState.set('settings.event.back', this._hide.bind(this));
  }

  show() {
    D.HTMLState.set('settings.visible', true);
    D.SceneStore.setData('menuOpen', true);
    window.addEventListener('keydown', this._events.hide);
  }

  _hideEvent(event) {
    if (event.which === 27) {
      event.preventDefault();
      this._hide();
    }
  }

  _hide() {
    D.HTMLState.set('settings.visible', false);
    D.SceneStore.setData('menuOpen', false);
    window.removeEventListener('keydown', this._events.hide);

    if (!D.SceneStore.getData('gameInProgress')) {
      D.HTMLState.set('mainMenu.visible', true);
    }
  }
}

export default new Settings();
