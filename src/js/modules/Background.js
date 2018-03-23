import StringHelper from '../helpers/String';
import Timer from './Timer';

class Background {
  init() {
    this._options = null;

    this._background = new PIXI.Sprite();
    this._background.anchor.x = 0;
    this._background.anchor.y = 0;
    this._background.position.x = 0;
    this._background.position.y = 0;
    this._background.position.z = 1;

    this._backgroundClone = new PIXI.Sprite();
    this._backgroundClone.anchor.x = 0;
    this._backgroundClone.anchor.y = 0;
    this._backgroundClone.position.x = 0;
    this._backgroundClone.position.y = 0;
    this._backgroundClone.position.z = 0;

    this._sceneFader = new PIXI.Graphics();
    this._sceneFader.beginFill(0xFFFFFF);
    this._sceneFader.drawRect(0, 0, 1920, 1080);
    this._sceneFader.endFill();
    this._sceneFader = new PIXI.Sprite();
    this._sceneFader.tint = 0x000000;
    this._sceneFader.alpha = 0.001;
    this._sceneFader.position.z = 0;
    D.Renderer.generateTexture(this._sceneFader);

    this._dom = {};
    this._dom.fader = document.querySelector('.js_fader');
    this._dom.blink = document.querySelector('.js_blink');

    this._timer = new Timer();
    this._timer.addEvent('load', { callback: this._loadEvent.bind(this) });
    this._timer.addEvent('unload', {
      callback: this._unloadEvent.bind(this),
      runLimit: 30
    });
    this._timer.addEvent('showScene', { callback: this._showSceneEvent.bind(this) });
    this._timer.addEvent('hideScene', { callback: this._hideSceneEvent.bind(this) });
    this._timer.addEvent('blink', { callback: this._blinkEvent.bind(this) });
    this._timer.addEvent('change', {
      callback: this._changeEvent.bind(this),
      runLimit: 60
    });

    D.Stage.addChild(this._background);
    D.Stage.addChild(this._backgroundClone);
    D.Stage.addChild(this._sceneFader);
  }

  handleAction(options) {
    this._options = options;

    if (!this._options.event) {
      this._options.event = 'load';
    }

    switch(this._options.event) {
      case 'load': this._load(); break;
      case 'unload': this._unload(); break;
      case 'showScene': this._showScene(); break;
      case 'hideScene': this._hideScene(); break;
      case 'blink': this._blink(); break;
      case 'change': this._change(); break;
    }
  }

  getState() {
    let texturePath = this._background.texture.baseTexture.source.src;

    return {
      background: {
        texture: StringHelper.extractFilename(texturePath)
      },
      fader: {
        alpha: this._sceneFader.alpha,
        z: this._sceneFader.position.z,
        tint: this._sceneFader.tint
      }
    };
  }

  setState(data) {
    this._background.texture = PIXI.Texture.fromImage(data.background.texture);
    this._sceneFader.alpha = data.fader.alpha;
    this._sceneFader.z = data.fader.z;
    this._sceneFader.tint = data.fader.tint;
  }

  _showScene() {
    this._sceneFader.position.z = 0;
    this._timer.setRunLimit('showScene', this._options.duration ? this._options.duration : 60);
    this._timer.start('showScene');
  }

  _showSceneEvent(event) {
    const percent = event.runCount / event.runLimit;

    this._sceneFader.alpha = 1 - percent + 0.001;

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sceneFader.alpha = 0.001;
      this._timer.destroy('showScene');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _hideScene() {
    this._sceneFader.tint = this._options.tint ? parseInt('0x' + this._options.tint) : 0x000000;
    this._sceneFader.position.z = 100;
    this._timer.setRunLimit('hideScene', this._options.duration ? this._options.duration : 60);
    this._timer.start('hideScene');
  }

  _hideSceneEvent(event) {
    const percent = event.runCount / event.runLimit;

    this._sceneFader.alpha = percent + 0.001;

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sceneFader.alpha = 1;
      this._timer.destroy('hideScene');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _load() {
    let background = PIXI.Texture.fromImage(this._options.image);

    this._background.texture = background;
    this._background.alpha = 1;
    this._background.position.z = 1;

    this._dom.fader.classList.remove('d_fader--visible');
    this._timer.start('load');
  }

  _loadEvent(event) {
    if (event.over) {
      this._timer.destroy('load');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _unload() {
    this._dom.fader.classList.add('d_fader--visible');
  }

  _unloadEvent(event) {
    if (event.over) {
      this._timer.destroy('unload');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _change() {
    let background = PIXI.Texture.fromImage(this._options.image);

    this._backgroundClone.texture = this._background.texture;
    this._backgroundClone.alpha = this._background.alpha;
    this._backgroundClone.position.z = 1;

    this._background.texture = background;
    this._background.alpha = 0.001;
    this._background.position.z = 0;

    this._timer.start('change');
  }

  _changeEvent(event) {
    const percent = event.runCount / event.runLimit;

    this._background.alpha = percent + 0.001;
    this._background.position.z = 1;
    this._backgroundClone.alpha = (1 - percent) + 0.001;
    this._backgroundClone.position.z = 0;

    if (event.over) {
      this._background.alpha = 1;
      this._backgroundClone.alpha = 0.001;
      this._timer.destroy('change');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _blink() {
    this._dom.blink.classList.add('d_blink--visible');
    this._timer.setRunLimit('blink', this._options.duration ? this._options.duration : 30);
    this._timer.start('blink');
  }

  _blinkEvent(event) {
    const closePercent = event.runCount * 2 / event.runLimit;

    if (event.runCount <= event.runLimit / 2) {
      this._dom.blink.querySelector('#Mask ellipse').setAttribute('ry', Math.round((0.75 - closePercent * 0.75) * 100) + '%');
    } else if (event.runCount > event.runLimit / 2) {
      this._dom.blink.querySelector('#Mask ellipse').setAttribute('ry', Math.round((closePercent - 1) * 100) + '%');
    }

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._dom.blink.classList.remove('d_blink--visible');
      this._timer.destroy('blink');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }
}

export default new Background();
