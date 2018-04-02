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
    this._timer.addEvent('load', { onTick: this._loadEvent.bind(this) });
    this._timer.addEvent('unload', {
      onTick: this._unloadEvent.bind(this),
      tickLimit: 30
    });
    this._timer.addEvent('showScene', { onTick: this._showSceneEvent.bind(this) });
    this._timer.addEvent('hideScene', { onTick: this._hideSceneEvent.bind(this) });
    this._timer.addEvent('blink', { onTick: this._blinkEvent.bind(this) });
    this._timer.addEvent('change', {
      onTick: this._changeEvent.bind(this),
      tickLimit: 60
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
    let texturePath = this._background.texture.baseTexture.resource.source.src;

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
    this._timer.setEventOptions('showScene', { tickLimit: this._options.duration ? this._options.duration : 60 });
    this._timer.startEvent('showScene');
  }

  _showSceneEvent(state, options) {
    const percent = state.tickCount / options.tickLimit;

    this._sceneFader.alpha = 1 - percent + 0.001;

    if (state.over || D.SceneStore.getData('fastForward')) {
      this._sceneFader.alpha = 0.001;
      this._timer.endEvent('showScene');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _hideScene() {
    this._sceneFader.tint = this._options.tint ? parseInt('0x' + this._options.tint) : 0x000000;
    this._sceneFader.position.z = 100;
    this._timer.setEventOptions('hideScene', { tickLimit: this._options.duration ? this._options.duration : 60 });
    this._timer.startEvent('hideScene');
  }

  _hideSceneEvent(state, options) {
    const percent = state.tickCount / options.tickLimit;

    this._sceneFader.alpha = percent + 0.001;

    if (state.over || D.SceneStore.getData('fastForward')) {
      this._sceneFader.alpha = 1;
      this._timer.endEvent('hideScene');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _load() {
    let background = PIXI.Texture.fromImage(this._options.image);

    this._background.texture = background;
    this._background.alpha = 1;
    this._background.position.z = 1;

    this._dom.fader.classList.remove('d_fader--visible');
    this._timer.startEvent('load');
  }

  _loadEvent(state) {
    if (state.over) {
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _unload() {
    this._dom.fader.classList.add('d_fader--visible');
  }

  _unloadEvent(state) {
    if (state.over) {
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

    this._timer.startEvent('change');
  }

  _changeEvent(state, options) {
    const percent = state.tickCount / options.tickLimit;

    this._background.alpha = percent + 0.001;
    this._background.position.z = 1;
    this._backgroundClone.alpha = (1 - percent) + 0.001;
    this._backgroundClone.position.z = 0;

    if (state.over) {
      this._background.alpha = 1;
      this._backgroundClone.alpha = 0.001;
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _blink() {
    this._dom.blink.classList.add('d_blink--visible');
    this._timer.setEventOptions('blink', { tickLimit: this._options.duration ? this._options.duration : 30 });
    this._timer.startEvent('blink');
  }

  _blinkEvent(state, options) {
    const closePercent = state.tickCount * 2 / options.tickLimit;

    if (state.tickCount <= options.tickLimit / 2) {
      this._dom.blink.querySelector('#Mask ellipse').setAttribute('ry', Math.round((0.75 - closePercent * 0.75) * 100) + '%');
    } else if (state.tickCount > options.tickLimit / 2) {
      this._dom.blink.querySelector('#Mask ellipse').setAttribute('ry', Math.round((closePercent - 1) * 100) + '%');
    }

    if (state.over || D.SceneStore.getData('fastForward')) {
      this._timer.endEvent('blink');
      this._dom.blink.classList.remove('d_blink--visible');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }
}

export default new Background();
