import CommonHelper from '../helpers/Common';
import StringHelper from '../helpers/String';

class History {
  constructor() {
    this._history = [];

    this._events = {};
    this._events.hide = this._hideEvent.bind(this);
  }

  init() {
    D.HTMLState.set('history.event.back', this._hide.bind(this));
  }

  write(actor, text) {
    const entry = {
      actor: actor,
      text: text
    };

    this._history.push(entry);
  }

  erase() {
    this._history = [];
  }

  show() {
    D.HTMLState.set('history.visible', true);
    D.HTMLState.set('history.entries', this._generateEntries());
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
    D.HTMLState.set('history.visible', false);
    D.SceneStore.setData('menuOpen', false);

    window.removeEventListener('keydown', this._events.hide);
  }

  _generateEntries() {
    const entries = this._history.map((entry, index) => {
      const properties = {
        index: index,
        text: entry.text,
        avatar: false,
        color: false
      };

      if (entry.actor !== undefined) {
        if (entry.actor !== false && entry.actor !== 'player') {
          let actor = D.Character.loadCharacterById(entry.actor);
          actor = actor.getData();

          properties.avatar = 'static/char_' + actor.id + '_avatar.png';
          properties.color = 'rgba(' + StringHelper.hexToRgb(actor.color) + ',.4)';
        } else if (entry.actor === 'player') {
          properties.avatar = 'static/player_avatar.png';
          properties.color = 'rgba(' + StringHelper.hexToRgb(D.Variable.get('__globals__.player.bgColor')) + ',.4)';
        }
      }

      return properties;
    });

    return entries;
  }
}

export default new History();
