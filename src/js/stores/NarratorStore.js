import Store from './Store';

class NarratorStore extends Store {
  constructor() {
    super();

    this._data = {
      writeRunning: false
    };
  }
}

export default NarratorStore;