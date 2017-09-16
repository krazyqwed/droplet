class Goto {
  constructor() {
    this._options = false;
  }

  handleAction(options) {
    this._options = options;

    if (!this._options.event) {
      this._options.event = 'goto';
    }

    this['_' + this._options.event + 'Action']();
  }

  _gotoAction() {
    D.ActionQueue.run('post');
    D.Story.loadScene(this._options.scene, this._options.keyframe);
  }
}

export default new Goto();
