import Store from './Store';

class EngineStore extends Store {
  constructor() {
    super();

    this._data = {
      takeScreenshot: false
    };
  }
}

export default EngineStore;
