import StringHelper from '../helpers/String';
import Timer from './Timer';

class Background {
  init() {
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
    this._sceneFader = new PIXI.Sprite(this._sceneFader.generateTexture());
    this._sceneFader.tint = 0x000000;
    this._sceneFader.alpha = 0.001;
    this._sceneFader.position.z = 0;

    this._dom = {};
    this._dom.fader = document.querySelector('.js_fader');
    this._dom.blink = document.querySelector('.js_blink');

    this._timer = new Timer();
    this._timer.addEvent('showScene', this._showSceneEvent.bind(this), 1, true);
    this._timer.addEvent('hideScene', this._hideSceneEvent.bind(this), 1, true);
    this._timer.addEvent('blink', this._blinkEvent.bind(this), 1, true);
    this._timer.addEvent('change', this._changeEvent.bind(this), 1, true, 60);
    this._timer.addEvent('load', this._loadEvent.bind(this), 1, true, 90);

    D.Stage.addChild(this._background);
    D.Stage.addChild(this._backgroundClone);
    D.Stage.addChild(this._sceneFader);
  }

  handleAction(action) {
    this._action = action;

    if (!this._action.event) {
      this._action.event = 'show';
    }

    switch(this._action.event) {
      case 'showScene': this._showScene(); break;
      case 'hideScene': this._hideScene(); break;
      case 'blink': this._blink(); break;
      case 'change': this._change(); break;
      case 'load': this._load(); break;
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
    this._background.setTexture(PIXI.Texture.fromImage(data.background.texture));
    this._sceneFader.alpha = data.fader.alpha;
    this._sceneFader.z = data.fader.z;
    this._sceneFader.tint = data.fader.tint;
  }

  _showScene() {
    this._sceneFader.position.z = 0;
    this._timer.setRunLimit('showScene', this._action.duration ? this._action.duration : 60);
    this._timer.start('showScene');
  }

  _hideScene() {
    this._sceneFader.tint = this._action.tint ? parseInt('0x' + this._action.tint) : 0x000000;
    this._sceneFader.position.z = 100;
    this._timer.setRunLimit('hideScene', this._action.duration ? this._action.duration : 60);
    this._timer.start('hideScene');
  }

  _blink() {
    this._dom.blink.classList.add('d_blink--visible');
    this._timer.setRunLimit('blink', this._action.duration ? this._action.duration : 30);
    this._timer.start('blink');
  }

  _change() {

  }

  _load() {
    let background = PIXI.Texture.fromImage(this._action.background);

    this._backgroundClone.setTexture(this._background.texture);
    this._backgroundClone.alpha = this._background.alpha;
    this._backgroundClone.position.z = 1;

    this._background.setTexture(background);
    this._background.alpha = 0.001;
    this._background.position.z = 0;

    this._timer.start('load');
  }

  _showSceneEvent(event) {
    const percent = event.runCount / event.runLimit;

    this._sceneFader.alpha = 1 - percent + 0.001;

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sceneFader.alpha = 0.001;
      this._timer.destroy('showScene');
    }
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
    }
  }

  _hideSceneEvent(event) {
    const percent = event.runCount / event.runLimit;

    this._sceneFader.alpha = percent + 0.001;

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sceneFader.alpha = 1;
      this._timer.destroy('hideScene');
    }
  }

  _changeEvent(event) {

  }

  _loadEvent(event) {
    if (event.runCount === 1) {
      this._dom.fader.classList.add('d_fader--visible');
    } else if (event.runCount === 30) {
      this._background.alpha = 1;
      this._background.position.z = 1;
      this._backgroundClone.alpha = 0.001;
      this._backgroundClone.position.z = 0;
      this._sceneFader.alpha = 0.001;
      this._sceneFader.position.z = 0;
    } else if (event.runCount === 60) {
      this._dom.fader.classList.remove('d_fader--visible');
    }

    if (event.over) {
      this._timer.destroy('load');
    }
  }
}

export default new Background();
