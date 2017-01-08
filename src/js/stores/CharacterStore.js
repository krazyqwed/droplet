import Store from './Store';

class CharacterStore extends Store {
  constructor() {
    super();

    this._data = {
      animationRunning: false
    };
  }
}

export default CharacterStore;