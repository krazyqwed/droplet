class ActionQueue {
  constructor() {
    this._queue = {
      pre: [],
      frame: [],
      post: []
    };
  }

  add(type, action) {
    this._queue[type].push(action);
  }

  run(type) {
    this._queue[type].forEach((action, index) => {
      const moduleClassName = action.module.charAt(0).toUpperCase() + action.module.slice(1);
      D[moduleClassName].handleAction(action.options);
      delete this._queue[type][index];

      if (action.autoContinue) {
        this.autoContinue();
      }
    });
  }

  autoContinue() {
    D.SceneStore.subscribe('autoContinue', () => {
      D.SceneStore.unsubscribeAll('autoContinue');
      D.SceneStore.triggerCallback('actionFired');
    });
  }
}

export default new ActionQueue();
