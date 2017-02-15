import Store from './Store';

class EngineStore extends Store {
  constructor() {
    super();

    this._data = {
      createSave: false,
      alertAnswer: null,
    };
  }
}

export default EngineStore;
