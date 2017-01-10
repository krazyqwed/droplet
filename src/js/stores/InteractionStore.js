import Store from './Store';

class InteractionStore extends Store {
  constructor() {
    super();

    this._data = {
      interactionRunning: false
    };
  }
}

export default InteractionStore;