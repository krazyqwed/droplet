import Store from './Store';

class PixiStore extends Store {
  constructor() {
    super();

    this._data = {};
  }
}

export default PixiStore;
