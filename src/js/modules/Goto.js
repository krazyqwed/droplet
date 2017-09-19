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
    const currentState = D.Scene.getState();

    if (!this._options.scene || (this._options.scene && this._options.scene === currentState.scene.id)) {
      D.Scene.loadKeyframeById(this._options.keyframe);
    } else {
      D.Story.loadScene(this._options.scene, this._options.keyframe);
    }
  }
}

export default new Goto();
