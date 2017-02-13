import Store from './Store';

class EngineStore extends Store {
  constructor() {
    super();

    this._data = {
      createSave: false
    };
  }
}

export default EngineStore;
