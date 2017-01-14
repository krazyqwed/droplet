import Timer from './Timer';
import StringHelper from '../helpers/String';

class DText extends HTMLElement {
  connectedCallback() {
    if (this.getAttribute('d-color')) {
      this.style.color = this.getAttribute('d-color');
    }
  }
}

class DActor extends HTMLElement {
  connectedCallback() {
    if (this.getAttribute('d-color') !== undefined) {
      let color;
      const attr = this.getAttribute('d-id');

      if (attr === 'player') {
        color = D.Variable.get('__globals__.player.color');
      } else {
        const actor = D.Character.loadCharacterById(parseInt(attr));
        color = actor.getData()['color'];
      }

      this.style.color = color;
    }
  }
}

customElements.define('d-text', DText);
customElements.define('d-actor', DActor);

class TextClass {
  constructor() {
    this._elementType = 'textbox';
    this._store = false;
    this._cursorPosition = 0;
    this._textLength = 0;
    this._text = '';
    this._textFormatActive = false;
    this._writeSpeed = [1];
    this._writeOptions = {};
    this._fastForwarded = true;
    this._dom = {};
    this._dom.speaker = document.querySelector('.js_speaker');
    this._timer = new Timer();
    this._timer.addEvent('write', this._writeEvent.bind(this), this._writeSpeed[0], true);
  }

  init() {
    this._store = D.TextStore;

    this._dom.textBoxWrap = document.querySelector('.js_' + this._elementType + '_wrap');
    this._dom.textBox = document.querySelector('.js_' + this._elementType);
    this._dom.textBoxInner = document.querySelector('.js_' + this._elementType + '_inner');

    this._update();
  }

  loadText(text, options, async) {
    this._writeOptions = {
      async: async
    };

    this._fastForwarded = false;
    this._showTextbox(options);
    this._writeReset();
    this._setText(text, options);
  }

  hideTextbox(fade = true) {
    this._dom.textBoxWrap.classList.remove('d_gui-element--visible');

    if (!fade) {
      this._dom.textBoxWrap.classList.add('d_gui-element--no-fade');
    }

    this._writeReset();
  }

  _showTextbox(options) {
    if (options && options.position === 'top') {
      this._dom.textBoxWrap.classList.add('d_' + this._elementType + '-wrap--top');
    } else {
      this._dom.textBoxWrap.classList.remove('d_' + this._elementType + '-wrap--top');
    }

    requestAnimationFrame(() => {
      this._dom.textBoxWrap.classList.remove('d_gui-element--no-fade');
      this._dom.textBoxWrap.classList.add('d_gui-element--visible');
    });
  }

  _update() {
    requestAnimationFrame(() => {
      if (!this._fastForwarded && D.SceneStore.getData('fastForward')) {
        this._fastForwarded = true;
      }

      this._update();
    });
  }

  _setText(text, options) {
    this._text = text;

    let textContainer = document.createElement('div');
    textContainer.classList.add('d_' + this._elementType + '-helper');

    textContainer.innerHTML = this._text;

    if (options && options.noNext) {
      this._dom.textBoxInner.setAttribute('no-next', 'true');
    } else {
      this._dom.textBoxInner.removeAttribute('no-next');
    }

    document.body.appendChild(textContainer);
    this._insertVariables();
    this._insertActorProps();
    this._text = this._insertWraps(textContainer);
    textContainer.parentNode.removeChild(textContainer);

    this._textLength = this._text.length;

    this._showSpeaker(options);

    this._writeStart();
  }

  _insertVariables() {
    for (let i = 0; i <= this._text.length; i++) {
      if (this._text.substring(i, i + 7) === '<d-text') {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-text\s*.*?>/i);
        const attributes = this._getAttributes(match[0]);
        
        i += match[0].length - 1;

        this._handleVar(attributes['d-var'], i);
      }
    }
  }

  _insertActorProps() {
    for (let i = 0; i <= this._text.length; i++) {
      if (this._text.substring(i, i + 8) === '<d-actor') {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-actor\s*.*?>/i);
        const attributes = this._getAttributes(match[0]);
        
        i += match[0].length - 1;

        if (attributes['d-id'] && attributes['d-prop']) {
          if (attributes['d-id'] === 'player') {
            const prop = D.Variable.get('__globals__.player.' + attributes['d-prop']);
            this._text = StringHelper.splice(this._text, i + 1, 0, prop);
          } else {
            const character = D.Character.loadCharacterById(parseInt(attributes['d-id']));
            const prop = character.getData()[attributes['d-prop']];
            this._text = StringHelper.splice(this._text, i + 1, 0, prop);
          }
        }
      }
    }
  }

  _insertWraps(container) {
    container.innerHTML = '.';
    let height = container.offsetHeight;

    for (let i = 0; i <= this._text.length; i++) {
      if (this._text.substring(i, i + 7) === '<d-text') {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-text\s*.*?>/i);
        i += match[0].length - 1;
      } else if (this._text.substring(i, i + 9) === '</d-text>') {
        i += 8;
      } else if (this._text.substring(i, i + 8) === '<d-actor') {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-actor\s*.*?>/i);
        i += match[0].length - 1;
      } else if (this._text.substring(i, i + 10) === '</d-actor>') {
        i += 9;
      } else if (this._text.substring(i, i + 1) === '\\') {
        i += 1;
      } else if (this._text.substring(i, i + 1) === '&') {
        const match = this._text.substring(i - 1).match(/&[^\s]*;/i);

        if (match[0]) {
          i += match[0].length - 1;
        }
      }

      container.innerHTML = this._text.substring(0, i);

      if (height * 1.5 < container.offsetHeight) {
        height = container.offsetHeight;

        if (this._text[i - 1] !== ' ' && container.textContent.indexOf(' ') !== -1) {
          do {
            i--;
          } while (i > 0 && this._text[i] !== ' ' && this._text[i] !== '>');

          if (i === 0) {
            break;
          }

          this._text = StringHelper.splice(this._text, i + 1, 0, '<br>');
          i += 4;
        }
      }
    }

    return this._text;
  }

  _showSpeaker(options) {
    if (options && options.character) {
      this._dom.speaker.style.display = 'block';

      if (options.character !== 'player') {
        const character = D.Character.loadCharacterById(options.character);
        const characterData = character.getData();
        this._dom.speaker.innerHTML = characterData.nickname;
        this._dom.speaker.style.backgroundColor = characterData.color;
      } else {
        this._dom.speaker.innerHTML = D.Variable.get('__globals__.player.nickname');
        this._dom.speaker.style.backgroundColor = D.Variable.get('__globals__.player.bgColor');
      }
    } else {
      this._dom.speaker.style.display = 'none';
    }
  }

  _writeStart() {
    this._store.setData('writeRunning', true);
    this._dom.textBox.setAttribute('running', 'true');
    this._timer.start('write');
  }

  _writeReset() {
    this._cursorPosition = 0;
    this._store.setData('writeRunning', false);
    this._writeSpeed = [1];
    this._dom.textBoxInner.innerHTML = '';
    this._timer.destroy('write');
  }

  _writeEvent(event) {
    if (this._cursorPosition > this._textLength || (this._fastForwarded && !this._writeOptions.async) || event.over) {
      this._writeReset();

      this._dom.textBoxInner.innerHTML = this._text;
      this._dom.textBox.removeAttribute('running');

      return;
    }

    if (this._text.substring(this._cursorPosition - 1, this._cursorPosition + 6) === '<d-text') {
      const match = this._text.substring(this._cursorPosition - 1).match(/<\s*\/?\s*d-text\s*.*?>/i);
      const attributes = this._getAttributes(match[0]);

      this._handleSpeedAdd(attributes['d-speed']);

      this._cursorPosition += match[0].length - 1;
    } else if (this._text.substring(this._cursorPosition - 1, this._cursorPosition + 8) === '</d-text>') {
      this._handleSpeedRemove();

      this._cursorPosition += 8;
    } else if (this._text.substring(this._cursorPosition - 1, this._cursorPosition + 7) === '<d-actor') {
      const match = this._text.substring(this._cursorPosition - 1).match(/<\s*\/?\s*d-actor\s*.*?>/i);
      const attributes = this._getAttributes(match[0]);

      this._cursorPosition += match[0].length - 1;
    } else if (this._text.substring(this._cursorPosition - 1, this._cursorPosition + 9) === '</d-actor>') {
      this._cursorPosition += 9;
    } else if (this._text.substring(this._cursorPosition - 1, this._cursorPosition + 3) === '<br>') {
      this._cursorPosition += 3;
    } else if (this._text.substring(this._cursorPosition - 1, this._cursorPosition) === '\\') {
      this._cursorPosition += 1;
    } else if (this._text.substring(this._cursorPosition - 1, this._cursorPosition) === '&') {
      const match = this._text.substring(this._cursorPosition - 1).match(/&[^\s]*;/i);

      if (match[0]) {
        this._cursorPosition += match[0].length - 1;
      }
    }

    this._dom.textBoxInner.innerHTML = this._text.substring(0, this._cursorPosition);

    this._cursorPosition++;
  }

  _getAttributes(elem) {
    let attributes = {};
    let temp = document.createElement('div');
    temp.innerHTML = elem;
    
    Array.prototype.slice.call(temp.childNodes[0].attributes).forEach(function(item) {
      attributes[item.name] = item.value;
    });

    return attributes;
  }

  _handleSpeedAdd(speed) {
    if (speed) {
      this._writeSpeed.push(parseInt(speed));
    } else {
      this._writeSpeed.push(this._writeSpeed.slice(-1)[0]);
    }

    this._timer.setTickRate('write', this._writeSpeed.slice(-1)[0]);
  }

  _handleSpeedRemove() {
    this._writeSpeed.pop();

    this._timer.setTickRate('write', this._writeSpeed.slice(-1)[0]);
  }

  _handleVar(name, i) {
    if (name) {
      const variable = D.Variable.get(name);
      this._text = StringHelper.splice(this._text, i + 1, 0, variable);
    }
  }

  _handleActor(name, i) {
    if (name) {
      const variable = D.Variable.get(name);
      this._text = StringHelper.splice(this._text, i + 1, 0, variable);
    }
  }
}

class NarratorClass extends TextClass {
  constructor() {
    super();

    this._elementType = 'narrator';
  }

  init() {
    this._store = D.NarratorStore;

    this._dom.textBoxWrap = document.querySelector('.js_' + this._elementType + '_wrap');
    this._dom.textBox = document.querySelector('.js_' + this._elementType);
    this._dom.textBoxInner = document.querySelector('.js_' + this._elementType + '_inner');

    D.SceneStore.subscribe('skipAsync', (value) => {
      if (this._writeOptions.async) {
        this._writeOptions.async = false;
        this._timer.over('write');

        if (this._store.getData('writeRunning')) {
          D.SceneStore.setData('fastForward', false);
        }
      }
    });

    this._update();
  }
}

let text = new TextClass();
let narrator = new NarratorClass();

export {
  text as Text,
  narrator as Narrator
};
