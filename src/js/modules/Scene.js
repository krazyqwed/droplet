import Timer from './Timer';

class Scene {
  constructor() {
    this._scene = false;
    this._sceneLoaded = false;

    this._keyframeId = false;
    this._keyframe = 0;
    this._subframe = 0;
    this._loadedByAction = false;

    this._textFinished = false;
    this._narratorFinished = false;
    this._interactionFinished = false;

    this._timer = new Timer();
    this._timer.addEvent('load', {
      callback: this._loadEvent.bind(this),
      runLimit: 90
    });

    this._event = {};
    this._event.scrollEvent = this._scrollEvent.bind(this);
    this._event.mousedownEvent = this._mousedownEvent.bind(this);
    this._event.keydownEvent = this._keydownEvent.bind(this);
  }

  init() {
    D.SceneStore.subscribe('actionFired', () => {
      D.SceneStore.setData('autoContinue', false, false);
      this.fastForward();
    });

    D.SceneStore.subscribe('autoContinue', value => {
      if (!value) {
        return;
      }

      D.SceneStore.triggerCallback('actionFired');
    });

    this._input();
  }

  loadScene(scene, keyframeId = false, subframe = 0) {
    this._scene = scene;
    this._sceneLoaded = false;
    this._keyframeId = keyframeId || scene.startingKeyframe;
    this._subframe = subframe;

    this._prepareScene();
  }

  loadKeyframeById(id) {
    D.ActionQueue.empty('frame');

    this._loadedByAction = false;

    this._scene.keyframes.forEach((keyframe) => {
      if (id !== keyframe.id) {
        return;
      }

      D.SceneStore.setData('fastForward', false);

      this._keyframe = keyframe;
      this._loadKeyframe(keyframe);
    });
  }

  fastForward() {
    if (!this._sceneLoaded) {
      return;
    }

    D.SceneStore.setData('fastForward', true);

    if (!this._canJumpToNext()) {
      return;
    }

    this.loadNextFrame();
  }

  loadNextFrame() {
    D.SceneStore.setData('fastForward', false);
    D.Character.forceEndAnimations();
    D.Picture.forceEndAnimations();
    D.Wait.forceEnd();

    if (this._subframe < this._keyframe.actions.length - 1) {
      ++this._subframe;
      this._loadSubframe(this._keyframe.actions[this._subframe]);
    } else {
      D.Goto.handleAction(this._keyframe.goto);
    }
  }

  getState() {
    return {
      scene: this._scene,
      keyframe: this._keyframe.id,
      subframe: this._subframe
    }
  }

  _input() {
    window.addEventListener('mousewheel', this._event.scrollEvent, false);
    window.addEventListener('DOMMouseScroll', this._event.scrollEvent, false);
    window.addEventListener('mousedown', this._event.mousedownEvent, false);
    window.addEventListener('keydown', this._event.keydownEvent, false);
  }

  _scrollEvent(event) {
    if (event.target.classList.contains('.js_prevent_skip') || event.target.closest('.js_prevent_skip')) {
      return;
    }

    const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

    if (delta === -1) {
      event.preventDefault();
      D.SceneStore.triggerCallback('actionFired');
    }
  }

  _mousedownEvent(event) {
    if (event.which !== 1 || !event.target) {
      return;
    }

    if (event.target.classList.contains('.js_prevent_skip') || event.target.closest('.js_prevent_skip')) {
      return;
    }

    const classList = event.target.classList;
    const isButton = classList.contains('d_button');
    const isInput = classList.contains('js_input');

    if (isButton || isInput) {
      return;
    }

    event.preventDefault();
    D.SceneStore.triggerCallback('actionFired');
  }

  _keydownEvent(event) {
    if (event.target.classList.contains('js_input')) {
      return;
    }

    if (event.which === 32 || event.which === 13) {
      event.preventDefault();
      D.SceneStore.triggerCallback('actionFired');
    }
  }

  _prepareScene() {
    D.SceneStore.setData('fastForward', false);

    this._scene.pre.forEach((action) => {
      D.ActionQueue.add('pre', action);
    });

    this._scene.post.forEach((action) => {
      D.ActionQueue.add('post', action);
    });

    this._timer.start('load');
  }

  _canJumpToNext() {
    const dialog = !D.SceneStore.getData('dialogRunning');
    const narrator = !D.SceneStore.getData('narratorRunning');
    const interaction = !D.SceneStore.getData('interactionRunning');

    return dialog && narrator && interaction;
  }

  _loadKeyframe(keyframe) {
    if (D.SceneStore.getData('loadFromSave')) {
      this._resetRunnings();
      this._loadSubframe(keyframe.actions[this._subframe]);
      return;
    }

    this._subframe = 0;

    if (this._handleConditions()) {
      return;
    }

    this._resetRunnings();
    this._loadSubframe(keyframe.actions[0]);
  }

  _loadSubframe(action) {
    if (action.constructor === Array) {
      action.forEach(parallelAction => {
        D.ActionQueue.add('frame', parallelAction);
        D.ActionQueue.run('frame');
      });
    } else if (action.actions) {
      action.actions.forEach(parallelAction => {
        D.ActionQueue.add('frame', parallelAction);
        D.ActionQueue.run('frame');
      });

      if (action.autoContinue) {
        D.SceneStore.setData('autoContinue', true, false);
      }
    } else {
      D.ActionQueue.add('frame', action);
      D.ActionQueue.run('frame');
    }
  }

  _resetRunnings() {
    D.SceneStore.setData('textRunning', false);
    D.SceneStore.setData('narratorRunning', false);
    D.SceneStore.setData('interactionRunning', false);
  }

  _handleConditions() {
    if (this._keyframe.condition && !D.Variable.if(this._keyframe.condition)) {
      this.loadNextFrame();

      return true;
    }

    return false;
  }

  _loadEvent(event) {
    if (event.runCount === 1) {
      D.Background.handleAction({ event: 'unload' });
    }

    if (event.runCount === event.runLimit / 2) {
      D.ActionQueue.run('post');

      [].forEach.call(document.querySelectorAll('.d_gui-element--visible'), (element) => {
        element.classList.add('d_gui-element--no-fade');
        element.classList.remove('d_gui-element--visible');
      });

      if (!D.SceneStore.getData('loadFromSave')) {
        D.Character.hideCharacters();
        D.Picture.hidePictures();
      }

      D.Choose.clearChoose();
      D.Input.clearInput();
      D.Sound.stopAll();

      D.ActionQueue.run('pre');
    }

    if (event.over) {
      this.loadKeyframeById(this._keyframeId);

      D.SceneStore.setData('loadFromSave', false);
      D.GameMenu.show();

      this._sceneLoaded = true;
      this._timer.destroy('load');
    }
  }
}

export default new Scene();
