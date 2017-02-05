import CommonHelper from '../helpers/Common';
import StringHelper from '../helpers/String';

class History {
  constructor() {
    this._history = [];
    this._dom = {};
    this._dom.wrap = document.querySelector('.js_history');
    this._dom.content = document.querySelector('.js_history_content');
    this._events = {};
    this._events.show = this._showEvent.bind(this);
  }

  writeHistory(actor, text) {
    const entry = {
      actor: actor,
      text: text
    };

    this._history.push(entry);
  }

  show() {
    this._dom.content.innerHTML = '';

    this._generateEntries();

    this._dom.wrap.style.display = 'block';
    this._dom.wrap.classList.add('d_history-wrap--visible');
    this._dom.content.scrollTop = this._dom.content.scrollHeight;

    window.addEventListener('keydown', this._events.show);
  }

  _showEvent(event) {
    if (event.which === 27) {
      event.preventDefault();
      this._hide();
    }
  }

  _hide() {
    this._dom.wrap.classList.remove('d_history-wrap--visible');
    CommonHelper.requestTimeout(() => {
      this._dom.wrap.style.display = 'none';
    }, 300);

    window.removeEventListener('keydown', this._events.show);
  }

  _generateEntries() {
    this._history.forEach((entry) => {
      const element = document.createElement('div');
      element.classList.add('d_history__entry');
      element.innerHTML = entry.text;

      if (entry.actor !== undefined) {
        element.classList.add('d_history__entry--avatar');

        const avatar = document.createElement('div');
        const avatarImage = document.createElement('img');
        avatar.classList.add('d_history__avatar');

        if (entry.actor !== false && entry.actor !== 'player') {
          let actor = D.Character.loadCharacterById(entry.actor);
          actor = actor.getData();

          avatarImage.src = 'static/char_' + actor.id + '_avatar.png';
          element.style.backgroundColor = 'rgba(' + StringHelper.hexToRgb(actor.color) + ',.4)';
        } else if (entry.actor === 'player') {
          avatarImage.src = 'static/player_avatar.png';
          element.style.backgroundColor = 'rgba(' + StringHelper.hexToRgb(D.Variable.get('__globals__.player.bgColor')) + ',.4)';
        }

        avatar.appendChild(avatarImage);
        element.appendChild(avatar);
      }

      this._dom.content.appendChild(element);
    });
  }
}

export default new History();
