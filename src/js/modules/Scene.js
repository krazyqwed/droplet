import Timer from './Timer';

class Scene {
  constructor() {
    this._scene = false;
    this._sceneLoaded = false;

    this._keyframe = 0;
    this._loadedByAction = false;

    this._textFinished = false;
    this._narratorFinished = false;
    this._interactionFinished = false;

    this._timer = new Timer();
    this._timer.addEvent('load', this._loadEvent.bind(this), 1, true, 90);
  }

  init() {
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

  loadNextFrame() {
    D.SceneStore.setData('fastForward', false);
    D.Character.forceEndAnimations();

    this._loadKeyframe(this._scene.keyframes[++this._keyframe]);
  }

  _input() {
    function scrollEvent(event) {
      const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

      if (delta === -1) {
        event.preventDefault();
        D.SceneStore.setData('actionFired', Math.random());
        this._fastForward();
      }
    }

    window.addEventListener('mousewheel', scrollEvent.bind(this), false);
    window.addEventListener('DOMMouseScroll', scrollEvent.bind(this), false);

    window.addEventListener('mousedown', (event) => {
      if (!event.target.classList.contains('js_input') && !event.target.classList.contains('js_input_button')) {
        event.preventDefault();
        D.SceneStore.setData('actionFired', Math.random());
        this._fastForward();
      }
    }, false);

    window.addEventListener('keydown', (event) => {
      if (!event.target.classList.contains('js_input')) {
        if (event.which === 32 || event.which === 13) {
          event.preventDefault();
          D.SceneStore.setData('actionFired', Math.random());
          this._fastForward();
        }
      }
    }, false);
  }

  _prepareScene() {
    D.SceneStore.setData('fastForward', false);

    D.Background.handleAction({
      event: 'load',
      background: this._scene.background
    });

    D.Sound.handleAction({
      event: 'bgm',
      sound: this._scene.bgm
    });

    this._timer.start('load');
  }

  _fastForward() {
    if (!this._sceneLoaded) {
      return;
    }

    D.SceneStore.setData('fastForward', true);

    if (this._canJumpToNext()) {
      if (this._scene.keyframes[this._keyframe].goTo) {
        if (this._scene.keyframes[this._keyframe].goTo.scene) {
          D.Story.loadScene(this._scene.keyframes[this._keyframe].goTo.scene);
          return;
        }
      }

      this.loadNextFrame();
    }
  }

  _canJumpToNext() {
    const text = !D.SceneStore.getData('textRunning');
    const narrator = !D.SceneStore.getData('narratorRunning');
    const interaction = !D.SceneStore.getData('interactionRunning');

    return text && narrator && interaction;
  }

  _loadKeyframe(keyframe) {
    if (this._handleConditions()) {
      return;
    }

    this._resetRunnings();

    keyframe.actions.forEach((action) => {
      switch (action.type) {
        case 'background': D.Background.handleAction(action); break;
        case 'sound': D.Sound.handleAction(action); break;
        case 'variable': D.Variable.handleAction(action); break;
        case 'dialog': D.Text.handleAction(action); break;
        case 'narrator': D.Narrator.handleAction(action); break;
        case 'character': D.Character.handleAction(action); break;
        case 'choose': D.Choose.handleAction(action); break;
        case 'input': D.Input.handleAction(action); break;
      }
    });
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
    if (event.runCount === 60) {
      [].forEach.call(document.querySelectorAll('.d_gui-element--visible'), (element) => {
        element.classList.add('d_gui-element--no-fade');
        element.classList.remove('d_gui-element--visible');
      });

      D.Character.hideCharacters();
      D.Choose.clearChoose();
      D.Input.clearInput();
    }

    if (event.over) {
      this._sceneLoaded = true;
      this._loadKeyframe(this._scene.keyframes[this._keyframe]);
      this._timer.destroy('load');
    }
  }
}

export default new Scene();
