import Timer from './Timer';

class Scene {
  constructor() {
    this._scene = false;
    this._sceneLoaded = false;

    this._background = new PIXI.Sprite();
    this._background.anchor.x = 0;
    this._background.anchor.y = 0;
    this._background.position.x = 0;
    this._background.position.y = 0;

    this._backgroundClone = new PIXI.Sprite();
    this._backgroundClone.anchor.x = 0;
    this._backgroundClone.anchor.y = 0;
    this._backgroundClone.position.x = 0;
    this._backgroundClone.position.y = 0;

    this._bgm = false;

    this._keyframe = 0;
    this._loadedByAction = false;

    this._textFinished = false;
    this._narratorFinished = false;
    this._characterFinished = false;
    this._interactionFinished = false;

    this._dom = {};
    this._dom.fader = document.querySelector('.js_fader');

    this._timer = new Timer();
    this._timer.addEvent('load', this._loadEvent.bind(this), 1, true, 90);
  }

  init() {
    this._input();

    D.Stage.addChild(this._background);
    D.Stage.addChild(this._backgroundClone);
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

      return false;
    });
  }

  loadNextFrame() {
    D.SceneStore.setData('fastForward', false);

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

    let background = PIXI.Texture.fromImage('static/' + this._scene.background + '.jpg');

    this._backgroundClone.setTexture(this._background.texture);
    this._backgroundClone.alpha = 1;
    this._backgroundClone.position.z = 1;

    this._background.setTexture(background);
    this._background.alpha = 0.001;
    this._background.position.z = 0;

    if (this._scene.bgm && this._scene.bgm !== true && this._scene.bgm !== false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();

          this._createMusic(this._scene.bgm);
        });

        this._bgm.fade(1, 0, 500);
      } else {
        this._createMusic(this._scene.bgm);
      }
    } else if (this._scene.bgm === false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();
          this._bgm = false;
        });
        this._bgm.fade(1, 0, 500);
      }
    }

    this._dom.fader.classList.add('d_fader--visible');

    this._timer.start('load');
  }

  _createMusic(bgm) {
    this._bgm = new Howl({
      src: ['static/' + bgm + '.mp3'],
      loop: true
    });
    this._bgm.play();
    this._bgm.fade(0, 1, 500);
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
    const character = !D.SceneStore.getData('characterRunning');
    const interaction = !D.SceneStore.getData('interactionRunning');

    return text && narrator && character && interaction;
  }

  _loadKeyframe(keyframe) {
    if (this._handleConditions()) {
      return;
    }

    this._resetRunnings();

    keyframe.actions.forEach((action) => {
      switch (action.type) {
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
    D.SceneStore.setData('characterRunning', false);
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
    if (event.runCount === 30) {
      this._background.alpha = 1;
      this._background.position.z = 1;
      this._backgroundClone.alpha = 0.001;
      this._backgroundClone.position.z = 0;
    } else if (event.runCount === 60) {
      D.Text.hideTextbox(false);
      D.Narrator.hideTextbox(false);
      D.Choose.hideChoose(false);
      D.Input.hideInput(false);
      D.Character.hideCharacters();
      this._dom.fader.classList.remove('d_fader--visible');
    }

    if (event.over) {
      this._sceneLoaded = true;
      this._loadKeyframe(this._scene.keyframes[this._keyframe]);
      this._timer.destroy('load');
    }
  }
}

export default new Scene();
