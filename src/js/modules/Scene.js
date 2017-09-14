import Timer from './Timer';

class Scene {
  constructor() {
    this._scene = false;
    this._sceneLoaded = false;

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
      D.SceneStore.unsubscribeAll('autoContinue');
      this.fastForward();
    });

    this._input();
  }

  loadScene(scene, keyframe) {
    this._scene = scene;
    this._sceneLoaded = false;
    this._keyframe = keyframe;

    this._prepareScene();
  }

  loadKeyframeById(keyframeId) {
    this._loadedByAction = false;

    this._scene.keyframes.some((keyframe, i) => {
      if (keyframeId === keyframe.id) {
        D.SceneStore.setData('fastForward', false);

        this._keyframe = i;
        this._loadKeyframe(this._scene.keyframes[this._keyframe]);

        return true;
      }
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

    if (this._subframe >= this._scene.keyframes[this._keyframe].actions.length - 1) {
      if (this._scene.keyframes[this._keyframe].goTo && this._scene.keyframes[this._keyframe].goTo.scene) {
        D.ActionQueue.run('post');
        D.Story.loadScene(this._scene.keyframes[this._keyframe].goTo.scene);

        return;
      }
    }

    this.loadNextFrame();
  }

  loadNextFrame() {
    D.SceneStore.setData('fastForward', false);
    D.Character.forceEndAnimations();
    D.Picture.forceEndAnimations();

    if (this._subframe < this._scene.keyframes[this._keyframe].actions.length - 1) {
      ++this._subframe;
      this._loadSubframe(this._scene.keyframes[this._keyframe].actions[this._subframe]);
    } else {
      ++this._keyframe;
      this._loadKeyframe(this._scene.keyframes[this._keyframe]);
    }
  }

  getState() {
    return {
      scene: this._scene,
      keyframe: this._keyframe
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
    if (!event.target.classList.contains('js_input')) {
      if (event.which === 32 || event.which === 13) {
        event.preventDefault();
        D.SceneStore.triggerCallback('actionFired');
      }
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
        D.ActionQueue.autoContinue();
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
    if (this._scene.keyframes[this._keyframe].condition && !D.Variable.if(this._scene.keyframes[this._keyframe].condition)) {
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
      this._loadKeyframe(this._scene.keyframes[this._keyframe]);

      D.SceneStore.setData('loadFromSave', false);
      D.GameMenu.show();

      this._sceneLoaded = true;
      this._timer.destroy('load');
    }
  }
}

export default new Scene();
