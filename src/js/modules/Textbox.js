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

class TextboxClass {
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
    this._writeSpeed = 1;
    this._writeSpeedArray = [];

    this._timer = new Timer();
    this._timer.addEvent('write', { onTick: this._writeEvent.bind(this) });
  }

  init() {
    D.SceneStore.subscribe('actionFired', () => {
      this._actionFired = true;

      if (!this._writeRunning && this._subframe < this._textList.length) {
        this._actionFired = false;
        this._setText();
      }
    });
  }

  handleAction(options) {
    this._options = options;

    if (!this._options.event) {
      this._options.event = 'show';
    }

    switch (this._options.event) {
      case 'show': this._showTextbox(); break;
      case 'hide': this.hideTextbox(); break;
    }
  }

  hideTextbox() {
    D.HTMLState.set(`gui.${this._elementType}.visible`, false);
  }

  _showTextbox() {
    D.HTMLState.set(`gui.${this._elementType}.visible`, true);
    D.SceneStore.setData(`${this._elementType}Running`, true);

    this._actionFired = false;
    this._subframe = 0;
    this._textList = false;
    this._writeSpeedArray = [this._options.speed || this._writeSpeed];

    D.HTMLState.set(`gui.${this._elementType}.text`, '');
    D.HTMLState.set(`gui.${this._elementType}.position`, 'top');
    D.HTMLState.set(`gui.${this._elementType}.next`, true);
    D.HTMLState.set(`gui.${this._elementType}.background`, true);

    if (this._options.position) {
      D.HTMLState.set(`gui.${this._elementType}.position`, this._options.position);
    }

    if (this._options.noNext) {
      D.HTMLState.set(`gui.${this._elementType}.next`, false);
    }

    if (this._options.noBackground) {
      D.HTMLState.set(`gui.${this._elementType}.background`, false);
    }

    if (Array.isArray(this._options.text)) {
      this._textList = this._options.text;
    }

    this._showSpeaker();
    this._setText();
  }

  _setText() {
    D.HTMLState.set(`gui.${this._elementType}.running`, true);

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
      D.History.write(this._options.character, this._text);
    }

    this._textLength = this._text.length;

    this._timer.setEventOptions('write', { tickRate: this._options.speed || this._writeSpeed });
    
    if (this._options.speed === 0) {
      this._timer.endEvent('write');
    } else {
      this._timer.startEvent('write');
    }
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

      if (height * 1.5 <= container.offsetHeight) {
        height = container.offsetHeight;

        if (this._text[i - 1] !== ' ' && this._text[i - 1] !== '-') {
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
      if (this._options.character !== 'player') {
        const character = D.Character.loadCharacterById(this._options.character);
        const characterData = character.getData();

        D.HTMLState.set(`gui.${this._elementType}.speaker`, characterData.nickname);
        D.HTMLState.set(`gui.${this._elementType}.speakerColor`, characterData.color);
      } else {
        D.HTMLState.set(`gui.${this._elementType}.speaker`, D.Variable.get('__globals__.player.nickname'));
        D.HTMLState.set(`gui.${this._elementType}.speakerColor`, D.Variable.get('__globals__.player.bgColor'));
      }
    } else {
      D.HTMLState.set(`gui.${this._elementType}.speaker`, false);
    }
  }

  _writeEvent(state) {
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
    const fadeText = `<d-text d-fade>${tempText.slice(cursorBefore - this._cursorPosition - 1)}</d-text>`;
    tempText = tempText.slice(0, -1);
    tempText += fadeText;

    D.HTMLState.set(`gui.${this._elementType}.text`, tempText);

    this._cursorPosition++;

    if (this._cursorPosition > this._textLength || this._actionFired || state.over) {
      this._timer.endEvent('write');

      this._actionFired = false;
      this._writeRunning = false;

      D.HTMLState.set(`gui.${this._elementType}.running`, false);
      D.HTMLState.set(`gui.${this._elementType}.text`, this._text);

      if (this._textList === false || this._subframe >= this._textList.length) {
        D.SceneStore.setData(`${this._elementType}Running`, false);
      }

      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _cursorIsOnText(source, position, keyword) {
    return source.substring(position, position + keyword.length) === keyword;
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
      this._writeSpeedArray.push(parseFloat(speed));
    } else {
      this._writeSpeedArray.push(this._writeSpeedArray.slice(-1)[0]);
    }

    this._timer.setEventOptions('write', { tickRate: this._writeSpeedArray.slice(-1)[0] });
  }

  _handleSpeedRemove() {
    this._writeSpeedArray.pop();
    this._timer.setEventOptions('write', { tickRate: this._writeSpeedArray.slice(-1)[0] });
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

class NarratorClass extends TextboxClass {
  constructor() {
    super();

    this._elementType = 'narrator';
  }
}

let textbox = new TextboxClass();
let narrator = new NarratorClass();

export {
  textbox as Textbox,
  narrator as Narrator
};
