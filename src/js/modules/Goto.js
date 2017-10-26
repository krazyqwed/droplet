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
    const { scene, keyframe } = this._checkConditions();
    const currentState = D.Scene.getState();

    if (!scene) {
      D.Scene.loadKeyframeById(keyframe);
    } else if (scene && scene === currentState.scene.id) {
      D.Story.loadScene(scene);
    } else {
      D.Story.loadScene(scene, keyframe);
    }
  }

  _checkConditions() {
    if (!this._options.conditions) {
      return {
        scene: this._options.scene,
        keyframe: this._options.keyframe
      };
    }

    const condition = this._options.conditions.filter(condition => D.Variable.if(condition.expression));
    const scene = condition[0] ? condition[0].scene : this._options.scene;
    const keyframe = condition[0] ? condition[0].keyframe : this._options.keyframe;

    return {
      scene: scene,
      keyframe: keyframe
    };
  }
}

export default new Goto();
