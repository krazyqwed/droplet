String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

class DText extends HTMLElement {
  connectedCallback() {
    if (this.getAttribute('d-color')) {
      this.style.color = this.getAttribute('d-color');
    }
  }
}

customElements.define('d-text', DText);

class Timer {
  constructor () {
    this._events = [];
    this._ticker = 0;

    this._tick();
  }

  addEvent(name, callback, tickRate, repeat) {
    let event = {
      name: name,
      running: false,
      callback: callback,
      tickRate: tickRate,
      repeat: repeat,
      over: false,
      runCount: 0,
      ticker: 0
    };

    this._events.push(event);

    return event;
  }

  start(name) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].running = true;
      }
    }
  }

  stop(name) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].running = false;
      }
    }
  }

  destroy(name) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].over = true;
      }
    }
  }

  setTickRate(name, rate) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].ticker = 0;
        this._events[i].tickRate = rate;
      }
    }
  }

  _tick() {
    requestAnimationFrame(() => {
      for (let i in this._events) {
        if (this._events[i].running && !this._events[i].over) {
          this._events[i].ticker++;

          if (this._events[i].ticker % this._events[i].tickRate === 0) {
            this._events[i].runCount++;

            if (!this._events[i].repeat) {
              this._events[i].over = true;
            }

            this._events[i].callback(this._events[i].runCount);
          }

          if (this._events[i] && this._events[i].ticker == this._events[i].tickRate) {
            this._events[i].ticker = 0;
          }
        }
      }

      this._tick();
    });
  }
}

class Text {
  constructor() {
    this._cursorPosition = 0;
    this._textLength = 0;
    this._text = '';
    this._textFormatActive = false;
    this._writeSpeed = [1];
    this._writeRunning = false;
    this._timer = new Timer();
    this._dom = {};
  }

  init() {
    this._dom.textBox = document.querySelector('.js_textbox');
    this._timer.addEvent('write', this._writeEvent.bind(this), this._writeSpeed[0], true);

    this._load();
  }

  _load() {
    //this._setText('You can use <d-text d-color="#f00">Formatted <d-text d-color="#0f0" d-italic d-underline>text</d-text>!</d-text> and you can <d-text d-color="#f0f" d-speed="3">change <d-text d-color="#00f">speeeed</d-text> dasd s dsa</d-text> as <d-text d-blink="3">well</d-text>. You can use <d-text d-color="#f00">Formatted <d-text d-color="#0f0">text</d-text>!</d-text> and you can <d-text d-color="#f0f" d-speed="3">change <d-text d-color="#00f">speeeed</d-text> dasd s dsa</d-text> as <d-text d-blink="3">well</d-text>. You can use <d-text d-color="#f00">Formatted <d-text d-color="#0f0">text</d-text>!</d-text> and you can <d-text d-color="#f0f" d-speed="3">change <d-text d-color="#00f">speeeed</d-text> dasd s dsa</d-text> as <d-text d-blink="3">well</d-text>. You can use <d-text d-color="#f00">Formatted <d-text d-color="#0f0">text</d-text>!</d-text> and you can <d-text d-color="#f0f" d-speed="3">change <d-text d-color="#00f">speeeed</d-text> dasd s dsa</d-text> as <d-text d-blink="3">well</d-text>.');
    this._setText('Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nobis aut sed explicabo ullam repellat est ipsa quaerat, alias omnis suscipit perspiciatis recusandae vitae, porro nisi maxime nulla, nesciunt nam et. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et magni ea commodi, facilis accusamus perspiciatis inventore earum vel qui accusantium error ipsa animi quisquam minus.');

    this._update();
  }

  _update() {
    requestAnimationFrame(() => {
      if (window.sceneStore.getData('fastForward') && this._writeRunning) {
        this._writeEnd();
      }

      this._update();
    });
  }

  _setText(text) {
    this._text = text;

    let textContainer = document.createElement('div');
    textContainer.classList.add('b_textbox-helper');
    textContainer.innerHTML = this._text;

    document.body.appendChild(textContainer);
    this._text = this._insertWraps(textContainer);
    textContainer.parentNode.removeChild(textContainer);

    this._textLength = this._text.length;

    this._writeStart();
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
      }

      container.innerHTML = this._text.substring(0, i);

      if (height < container.offsetHeight) {
        height = container.offsetHeight;

        if (this._text[i - 1] !== ' ') {
          do {
            i--;
          } while (i > 0 && this._text[i] !== ' ' && this._text[i] !== '>');

          this._text = this._text.splice(i + 1, 0, '<br>');
          i += 4;
        }
      }
    }

    return this._text;
  }

  _writeStart() {
    this._writeRunning = true;
    this._dom.textBox.setAttribute('running', '');
    this._timer.start('write');
  }

  _writeEnd() {
    this._writeRunning = false;
    this._writeSpeed = [1];
    this._timer.destroy('write');
    this._dom.textBox.innerHTML = this._text;
    this._dom.textBox.removeAttribute('running');
  }

  _writeEvent() {
    if (this._cursorPosition > this._textLength) {
      this._writeEnd();

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
}

export default new Text();
