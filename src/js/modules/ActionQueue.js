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
      switch (action.module) {
        case 'background': D.Background.handleAction(action.options); break;
        case 'sound': D.Sound.handleAction(action.options); break;
        case 'variable': D.Variable.handleAction(action.options); break;
        case 'dialog': D.Text.handleAction(action.options); break;
        case 'narrator': D.Narrator.handleAction(action.options); break;
        case 'character': D.Character.handleAction(action.options); break;
        case 'picture': D.Picture.handleAction(action.options); break;
        case 'choose': D.Choose.handleAction(action.options); break;
        case 'input': D.Input.handleAction(action.options); break;
        case 'filter': D.Filter.handleAction(action.options); break;
      }

      delete this._queue[type][index];
    });
  }
}

export default new ActionQueue();
