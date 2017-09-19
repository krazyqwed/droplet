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
      if (action.autoContinue || action.module === 'wait') {
        D.SceneStore.setData('autoContinue', true, false);
      }

      const moduleClassName = action.module.charAt(0).toUpperCase() + action.module.slice(1);
      D[moduleClassName].handleAction(action.options);
      delete this._queue[type][index];
    });
  }

  empty(type) {
    this._queue[type] = [];
  }
}

export default new ActionQueue();
