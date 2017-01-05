import Store from './Store';

class SceneStore extends Store {
  constructor() {
    super();

    this._data = {
      fastForward: false,
      nextScene: false
    };
  }
}

export default SceneStore;
