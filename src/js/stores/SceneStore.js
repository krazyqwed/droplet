import Store from './Store';

class SceneStore extends Store {
  constructor() {
    super();

    this._data = {
      gameInProgress: false,
      fastForward: false,
      autoContinue: false,
      nextScene: false,

      textboxRunning: false,
      narratorRunning: false,
      interactionRunning: false,

      menuOpen: false,

      loadFromSave: false
    };
  }
}

export default SceneStore;
