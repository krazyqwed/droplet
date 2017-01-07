import Store from './Store';

class TextStore extends Store {
  constructor() {
    super();

    this._data = {
      writeRunning: false
    };
  }
}

export default TextStore;