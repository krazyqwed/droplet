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
    this._subframe = 0;
    this._loadedByAction = false;

    this._textFinished = false;
    this._characterFinished = false;
    this._interactionFinished = false;

    this._dom = {};
    this._dom.fader = document.querySelector('.js_fader');

    this._timer = new Timer();
    this._timer.addEvent('load', this._loadEvent.bind(this), 1, true, 90);
    this._timer.addEvent('background', this._backgroundEvent.bind(this), 1, true, 30);
  }

  init() {
    this._input();

    D.TextStore.subscribe('writeRunning', (data) => {
      if (data === false) {
        this._textFinished = true;
      }
    });

    D.CharacterStore.subscribe('animationRunning', (data) => {
      if (data === false) {
        this._characterFinished = true;
      }
    });

    D.InteractionStore.subscribe('interactionRunning', (data) => {
      if (data === false) {
        this._interactionFinished = true;
        this._fastForward();
      }
    });

    D.Stage.addChild(this._background);
    D.Stage.addChild(this._backgroundClone);

    this._update();
  }

  loadScene(scene, keyframe) {
    this._scene = scene;
    this._sceneLoaded = false;
    this._keyframe = keyframe;

    this._prepareScene();
  }

  loadKeyframeById(keyframeId) {
    this._loadedByAction = true;

    this._scene.keyframes.some((keyframe, i) => {
      if (keyframeId === keyframe.id) {
        D.SceneStore.setData('fastForward', false);

        this._keyframe = i;
        this._subframe = 0;

        this._loadKeyframe(this._keyframe, this._subframe);

        return true;
      }

      return false;
    });
  }

  _input() {
    function scrollEvent(event) {
      const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

      if (delta === -1) {
        event.preventDefault();
        this._fastForward();
      }
    }

    window.addEventListener('mousewheel', scrollEvent.bind(this), false);
    window.addEventListener('DOMMouseScroll', scrollEvent.bind(this), false);

    window.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this._fastForward();
    }, false);

    window.addEventListener('keydown', (event) => {
      switch (event.which) {
        case 32: event.preventDefault(); this._fastForward(); break;
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

    if (this._scene.bgm && this._scene.bgm !== true) {
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
      this._bgm.on('fade', () => {
        this._bgm.unload();
        this._bgm = false;
      });
      this._bgm.fade(1, 0, 500);
    }

    this._dom.fader.classList.add('b_fader--visible');

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
      D.SceneStore.setData('fastForward', false);
      return;
    }

    if (this._scene.keyframes[this._keyframe] && !this._loadedByAction) {
      if (this._scene.keyframes[this._keyframe].goTo) {
        if (this._scene.keyframes[this._keyframe].goTo.scene) {
          D.Story.loadScene(this._scene.keyframes[this._keyframe].goTo.scene);
          return;
        }
      }

      if (!this._scene.keyframes[this._keyframe].async) {
        D.SceneStore.setData('skipAsync', Math.random());
      }

      if (D.SceneStore.getData('fastForward')) {
        this._loadNextFrame();
      } else {
        D.SceneStore.setData('fastForward', true);
      }
    }

    this._loadedByAction = false;
  }

  _loadKeyframe(keyframe, subframe) {
    if (!this._scene.keyframes[keyframe] || this._handleConditions()) {
      return;
    }

    this._setFinishedSubscriptions(this._scene.keyframes[keyframe].type);

    this._handleVariables();

    switch (this._scene.keyframes[keyframe].type) {
      case 'dialog': this._handleTypeDialog(keyframe, subframe); break;
      case 'character': this._handleTypeCharacter(keyframe); break;
      case 'choose': this._handleTypeChoose(keyframe); break;
    }
  }

  _loadSubframe() {
    this._subframe++;
    this._loadKeyframe(this._keyframe, this._subframe);
  }

  _loadSpecificFrame(keyframeId) {
    const keyframe = this._loadKeyframeById(keyframeId);
  }

  _loadNextFrame() {
    if (this._interactionFinished) {
      D.SceneStore.setData('fastForward', false);

      if (this._subframeCount - 1 > this._subframe) {
        this._loadSubframe();
      } else {
        this._keyframe++;
        this._subframe = 0;

        this._loadKeyframe(this._keyframe, this._subframe);
      }
    }
  }

  _setFinishedSubscriptions(type) {
    this._textFinished = true;
    this._characterFinished = true;
    this._interactionFinished = true;

    switch (type) {
      case 'dialog': this._textFinished = false; break;
      case 'character': this._characterFinished = false; break;
      case 'choose': this._interactionFinished = false; this._textFinished = false; break;
    }
  }

  _handleConditions() {
    if (this._scene.keyframes[this._keyframe].condition && !D.Variable.if(this._scene.keyframes[this._keyframe].condition)) {
      this._loadNextFrame();

      return true;
    }

    return false;
  }

  _handleVariables() {
    if (this._scene.keyframes[this._keyframe].variable) {
      const variables = this._scene.keyframes[this._keyframe].variable;

      variables.forEach((variable) => {
        D.Variable.set(variable.name, variable.value);
      });
    }
  }

  _handleTypeDialog(keyframe, subframe) {
    keyframe = this._scene.keyframes[keyframe];
    this._subframeCount = keyframe.dialog.length;

    D.Text.showTextbox();
    D.Text.loadText(keyframe.dialog[subframe], keyframe.options);
  }

  _handleTypeCharacter(keyframe) {
    keyframe = this._scene.keyframes[keyframe];
    this._subframeCount = 1;

    D.Character.setAction(keyframe.action, keyframe.options, keyframe.async);
  }

  _handleTypeChoose(keyframe) {
    keyframe = this._scene.keyframes[keyframe];
    this._subframeCount = 1;

    D.Choose.showChoose(keyframe.items, keyframe.options);
  }

  _update() {
    requestAnimationFrame(() => {
      if (this._scene && this._sceneLoaded && this._scene.keyframes[this._keyframe]) {
        if (this._textFinished && this._characterFinished) {
          D.SceneStore.setData('fastForward', true);

          if (this._scene.keyframes[this._keyframe].fastForward) {
            this._fastForward();
          }
        } else if (this._scene.keyframes[this._keyframe].async) {
          this._fastForward();
        }
      }

      this._update();
    });
  }

  _loadEvent(event) {
    if (event.runCount === 30) {
      this._background.alpha = 1;
      this._background.position.z = 1;
      this._backgroundClone.alpha = 0.001;
      this._backgroundClone.position.z = 0;
    } else if (event.runCount === 60) {
      D.Text.hideTextbox(false);
      D.Choose.hideChoose(false);
      D.Character.hideCharacters();
      this._dom.fader.classList.remove('b_fader--visible');
    }

    if (event.over) {
      this._sceneLoaded = true;
      this._loadKeyframe(this._keyframe, 0);
      this._timer.destroy('load');
    }
  }

  _backgroundEvent(event) {
    let percent = event.runCount / event.runLimit;

    this._background.alpha = percent + 0.001;
    this._backgroundClone.alpha = 1 - percent + 0.001;

    if (event.over) {
      this._background.alpha = 1;
      this._background.position.z = 1;
      this._backgroundClone.alpha = 0.001;
      this._backgroundClone.position.z = 0;

      this._timer.destroy('background');
    }
  }
}

export default new Scene();
