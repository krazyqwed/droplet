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
        const actor = D.Character.loadCharacterById(attr);
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
    this._options = null;

    this._elementType = 'textbox';
    this._actionFired = false;
    this._subframe = 0;
    this._cursorPosition = 0;
    this._textList = false;
    this._text = '';
    this._textLength = 0;
    this._textFormatActive = false;
    this._writeSpeed = [2];

    this._dom = {};
    this._dom.textBoxWrap = document.querySelector('.js_' + this._elementType + '_wrap');
    this._dom.textBox = document.querySelector('.js_' + this._elementType);
    this._dom.textBoxInner = document.querySelector('.js_' + this._elementType + '_inner');
    this._dom.speaker = document.querySelector('.js_speaker');

    this._timer = new Timer();
    this._timer.addEvent('write', this._writeEvent.bind(this), this._writeSpeed[0], true, 0, this._writeEventEvery.bind(this));
  }

  init() {
    D.SceneStore.subscribe('actionFired', () => {
      this._actionFired = true;

      if (!this._writeRunning && this._subframe < this._textList.length) {
        this._actionFired = false;
        this._setText(false);
      }
    });
  }

  handleAction(action) {
    this._options = action;

    if (!this._options.event) {
      this._options.event = 'show';
    }

    switch (this._options.event) {
      case 'show': this._showTextbox(); break;
      case 'hide': this.hideTextbox(); break;
    }
  }

  hideTextbox() {
    this._dom.textBoxWrap.classList.remove('d_gui-element--visible');
  }

  _showTextbox() {
    D.SceneStore.setData((this._elementType === 'textbox' ? 'text' : 'narrator') + 'Running', true);

    this._actionFired = false;
    this._subframe = 0;
    this._textList = false;
    this._writeSpeed = [2];
    this._dom.textBoxInner.innerHTML = '';

    if (this._options.position === 'top') {
      this._dom.textBoxWrap.classList.add('d_' + this._elementType + '-wrap--top');
    } else {
      this._dom.textBoxWrap.classList.remove('d_' + this._elementType + '-wrap--top');
    }

    this._dom.textBoxWrap.offsetHeight;
    this._dom.textBoxWrap.classList.remove('d_gui-element--no-fade');
    this._dom.textBoxWrap.classList.add('d_gui-element--visible');

    if (this._options.noNext) {
      this._dom.textBox.setAttribute('no-next', 'true');
    } else {
      this._dom.textBox.removeAttribute('no-next');
    }

    if (this._options.noBackground) {
      this._dom.textBox.setAttribute('no-background', 'true');
    } else {
      this._dom.textBox.removeAttribute('no-background');
    }

    if (Array.isArray(this._options.text)) {
      this._textList = this._options.text;
    }

    this._showSpeaker();
    this._setText();
  }

  _setText() {
    this._dom.textBox.setAttribute('running', 'true');
    this._writeRunning = true;
    this._cursorPosition = 0;

    if (this._textList.length) {
      this._text = this._textList[this._subframe];
      this._subframe++;
    } else {
      this._text = this._options.text;
    }

    let textHelper = document.createElement('div');
    textHelper.classList.add('d_' + this._elementType + '-helper');
    textHelper.innerHTML = this._text;

    document.body.appendChild(textHelper);
    this._insertVariables();
    this._insertActorProps();
    this._text = this._insertWraps(textHelper);
    textHelper.parentNode.removeChild(textHelper);

    if (!this._options.noHistory) {
      D.History.writeHistory(this._options.character, this._text);
    }

    this._textLength = this._text.length;

    this._timer.start('write');
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
            const character = D.Character.loadCharacterById(attributes['d-id']);
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
      if (this._cursorIsOnText(this._text, i, '<d-text')) {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-text\s*.*?>/i);
        i += match[0].length - 1;
      } else if (this._cursorIsOnText(this._text, i, '</d-text>')) {
        i += 8;
      } else if (this._cursorIsOnText(this._text, i, '<d-actor')) {
        const match = this._text.substring(i).match(/<\s*\/?\s*d-actor\s*.*?>/i);
        i += match[0].length - 1;
      } else if (this._cursorIsOnText(this._text, i, '</d-actor>')) {
        i += 9;
      } else if (this._cursorIsOnText(this._text, i, '\\')) {
        i += 1;
      } else if (this._cursorIsOnText(this._text, i, '&')) {
        const match = this._text.substring(i - 1).match(/&[^\s]*;/i);

        if (match[0]) {
          i += match[0].length - 1;
        }
      }

      container.innerHTML = this._text.substring(0, i);

      if (height * 1.5 < container.offsetHeight) {
        height = container.offsetHeight;

        if (this._text[i - 1] !== ' ' && container.textContent.indexOf(' ') !== -1 && container.textContent.indexOf('-') !== -1) {
          do {
            i--;
          } while (i > 0 && this._text[i] !== ' ' && this._text[i] !== '-' && this._text[i] !== '>');

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

  _showSpeaker() {
    if (this._options.character) {
      this._dom.speaker.style.display = 'block';

      if (this._options.character !== 'player') {
        const character = D.Character.loadCharacterById(this._options.character);
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

  _writeEvent(event) {
    const cursorBefore = this._cursorPosition;

    if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '<d-text')) {
      const match = this._text.substring(this._cursorPosition - 1).match(/<\s*\/?\s*d-text\s*.*?>/i);
      const attributes = this._getAttributes(match[0]);

      this._handleSpeedAdd(attributes['d-speed']);

      this._cursorPosition += match[0].length - 1;
    } else if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '</d-text>')) {
      this._handleSpeedRemove();

      this._cursorPosition += 8;
    } else if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '<d-actor')) {
      const match = this._text.substring(this._cursorPosition - 1).match(/<\s*\/?\s*d-actor\s*.*?>/i);
      const attributes = this._getAttributes(match[0]);

      this._cursorPosition += match[0].length - 1;
    } else if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '</d-actor>')) {
      this._cursorPosition += 9;
    } else if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '<br>')) {
      this._cursorPosition += 3;
    } else if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '\\')) {
      this._cursorPosition += 1;
    } else if (this._cursorIsOnText(this._text, this._cursorPosition - 1, '&')) {
      const match = this._text.substring(this._cursorPosition - 1).match(/&[^\s]*;/i);

      if (match[0]) {
        this._cursorPosition += match[0].length - 1;
      }
    }

    let tempText = this._text.substring(0, this._cursorPosition);
    const fadeText = '<d-text d-fade>' + tempText.slice(cursorBefore - this._cursorPosition - 1) + '</d-text>';
    tempText = tempText.slice(0, -1);
    tempText += fadeText;

    this._dom.textBoxInner.innerHTML = tempText;

    this._cursorPosition++;
  }

  _cursorIsOnText(source, position, keyword) {
    return source.substring(position, position + keyword.length) === keyword;
  }

  _writeEventEvery(event) {
    if (this._cursorPosition > this._textLength || this._actionFired || event.over) {
      this._actionFired = false;
      this._writeRunning = false;
      this._dom.textBoxInner.innerHTML = this._text;
      this._dom.textBox.removeAttribute('running');
      this._timer.destroy('write');

      if (this._textList === false || this._subframe >= this._textList.length) {
        D.SceneStore.setData((this._elementType === 'textbox' ? 'text' : 'narrator') + 'Running', false);
      }
    }
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
    this._dom.textBoxWrap = document.querySelector('.js_' + this._elementType + '_wrap');
    this._dom.textBox = document.querySelector('.js_' + this._elementType);
    this._dom.textBoxInner = document.querySelector('.js_' + this._elementType + '_inner');
  }
}

let text = new TextClass();
let narrator = new NarratorClass();

export {
  text as Text,
  narrator as Narrator
};
