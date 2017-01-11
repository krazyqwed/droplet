import Timer from './Timer';
import StringHelper from '../helpers/String';

class DText extends HTMLElement {
  connectedCallback() {
    if (this.getAttribute('d-color')) {
      this.style.color = this.getAttribute('d-color');
    }
  }
}

customElements.define('d-text', DText);

class Text {
  constructor() {
    this._cursorPosition = 0;
    this._textLength = 0;
    this._text = '';
    this._textFormatActive = false;
    this._writeSpeed = [1];
    this._fastForwarded = true;
    this._dom = {};
    this._dom.textBoxWrap = document.querySelector('.js_textbox_wrap');
    this._dom.textBox = document.querySelector('.js_textbox');
    this._dom.speaker = document.querySelector('.js_speaker');
    this._timer = new Timer();
    this._timer.addEvent('write', this._writeEvent.bind(this), this._writeSpeed[0], true);
  }

  init() {
    this._update();
  }

  loadText(text, options) {
    this._fastForwarded = false;
    this._writeReset();
    this._setText(text, options);
  }

  showTextbox() {
    this._dom.textBoxWrap.classList.remove('b_gui-element--no-fade');
    this._dom.textBoxWrap.classList.add('b_gui-element--visible');
  }

  hideTextbox(fade = true) {
    if (fade) {
      this._dom.textBoxWrap.classList.remove('b_gui-element--visible');
    } else {
      this._dom.textBoxWrap.classList.add('b_gui-element--no-fade');
    }

    this._writeReset();
  }

  _update() {
    requestAnimationFrame(() => {
      if (!this._fastForwarded && D.SceneStore.getData('fastForward')) {
        this._fastForwarded = true;

        this._writeReset();
        this._writeEnd();
      }

      this._update();
    });
  }

  _setText(text, options) {
    this._text = text;

    let textContainer = document.createElement('div');
    textContainer.classList.add('b_textbox-helper');
    textContainer.innerHTML = this._text;

    if (options && options.noNext) {
      this._dom.textBox.setAttribute('no-next', 'true');
    } else {
      this._dom.textBox.removeAttribute('no-next');
    }

    document.body.appendChild(textContainer);
    this._insertVariables();
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

  _insertWraps(container) {
    container.innerHTML = '.';
    let height = container.offsetHeight;

    for (let i = 0; i <= this._text.length; i++) {
      if (this._text.substring(i, i + 7) === '<d-text') {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-text\s*.*?>/i);
        i += match[0].length - 1;
      } else if (this._text.substring(i, i + 9) === '</d-text>') {
        i += 8;
      } else if (this._text.substring(i, i + 1) === '\\') {
        i += 1;
      } else if (this._text.substring(i, i + 1) === '&') {
        const match = this._text.substring(i - 1).match(/&[^\s]*;/i);

        if (match[0]) {
          i += match[0].length - 1;
        }
      }

      container.innerHTML = this._text.substring(0, i);

      if (height < container.offsetHeight) {
        height = container.offsetHeight;

        if (this._text[i - 1] !== ' ' && container.textContent.indexOf(' ') !== -1) {
          do {
            i--;
          } while (i > 0 && this._text[i] !== ' ' && this._text[i] !== '>');

          if (i === 0) {
            i = this._text.length;
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
        this._dom.speaker.innerHTML = D.Variable.get('__globals__.playerName');
        this._dom.speaker.style.backgroundColor = '#56b30c';
      }
    } else {
      this._dom.speaker.style.display = 'none';
    }
  }

  _writeStart() {
    D.TextStore.setData('writeRunning', true);
    this._dom.textBox.setAttribute('running', 'true');
    this._timer.start('write');
  }

  _writeReset() {
    this._cursorPosition = 0;
    D.TextStore.setData('writeRunning', false);
    this._writeSpeed = [1];
    this._dom.textBox.innerHTML = '';
    this._timer.destroy('write');
  }

  _writeEnd() {
    D.TextStore.setData('writeRunning', false);
    this._dom.textBox.innerHTML = this._text;
    this._dom.textBox.removeAttribute('running');
  }

  _writeEvent() {
    if (this._cursorPosition > this._textLength) {
      D.TextStore.setData('writeRunning', false);
      this._timer.destroy('write');

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

    this._dom.textBox.innerHTML = this._text.substring(0, this._cursorPosition);

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
}

export default new Text();
