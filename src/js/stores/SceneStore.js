import Store from './Store';

class SceneStore extends Store {
  constructor() {
    super();

    this._data = {
      fastForward: false,
      skipAsync: false,
      nextScene: false,

      textRunning: false,
      narratorRunning: false,
      characterRunning: false,
      interactionRunning: false
    };
  }
}

export default SceneStore;
