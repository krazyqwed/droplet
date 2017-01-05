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

  addEvent(name, callback, tick, repeat) {
    const event = {
      name: name,
      running: false,
      callback: callback,
      tick: tick,
      repeat: repeat,
      over: false,
      runCount: 0,
      ticker: 0
    };

    this._events.push(event);

    return event;
  }

  start(name) {
    console.log(name);
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
        delete this._events[i];
      }
    }
  }

  _tick() {
    requestAnimationFrame(() => {
      for (let i in this._events) {
        if (this._events[i].running && !this._events[i].over) {
          this._events[i].ticker++;

          if (this._events[i].ticker % this._events[i].tick === 0) {
            this._events[i].runCount++;
            this._events[i].callback(this._events[i].runCount);

            if (!this._events[i].repeat) {
              this._events[i].over = true;
            }
          }

          if (this._events[i].ticker == this._events[i].tick) {
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
    this._writeSpeed = 20;
    this._timer = new Timer();
  }

  init() {
    this._timer.addEvent('write', () => {
      this._cursorPosition++;
      console.log(this._cursorPosition);
    }, this._writeSpeed, true);

    this._load();
  }

  _load() {
    this._setText('This is a sample text from the game, you can use <d-text d-color="#f00">Formatted text</d-text> as well.');

    this._update();
  }

  _update() {
    requestAnimationFrame(() => {
      if (window.sceneStore.getData('fastForward')) {
        console.log('skipped');
      }

      this._render();
      this._update();
    });
  }

  _render() {
    window.renderer.render(window.stage);
  }

  _setText(text) {
    let textContainer = document.createElement('div');
    textContainer.innerHTML = text;
    console.log(textContainer.textContent.length, text.length);

    this._write();
  }

  _write() {
    this._timer.start('write');
  }
}

export default new Text();
