import Store from './Store';

class SceneStore extends Store {
  constructor() {
    super();

    this._data = {
      gameInProgress: false,
      fastForward: false,
      skipAsync: false,
      nextScene: false,

      textRunning: false,
      narratorRunning: false,
      interactionRunning: false,

      loadFromSave: false
    };
  }
}

export default SceneStore;
