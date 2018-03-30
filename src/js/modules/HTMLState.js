import state from '../html-state';

class HTMLState {
  constructor() {
    this._state = state;
  }

  get(name) {
    name = name.split('.');

    let obj = Object.assign({}, this._state);
    const len = name.length;

    for (let i = 0; i < len - 1; i++) {
      obj = obj[name[i]];
    }

    return obj[name[len - 1]];
  }

  set(name, value, obj) {
    if (!obj) {
      obj = this._state;
    }

    if (typeof(name) === 'string') {
      name = name.split('.');
    }

    if (name.length > 1) {
      this.set(name, value, obj[name.shift()]);
    } else {
      obj[name[0]] = value;
      D.HTMLRenderer.render();
    }
  }
}

export default new HTMLState();
