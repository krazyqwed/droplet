import Timer from './Timer'; 

class Background {
  constructor() {
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
    this._sceneFader.beginFill(0x000000);
    this._sceneFader.drawRect(0, 0, 1920, 1080);
    this._sceneFader.alpha = 0.001;
    this._sceneFader.position.z = 0;

    this._dom = {};
    this._dom.fader = document.querySelector('.js_fader');

    this._timer = new Timer();
    this._timer.addEvent('showScene', this._showSceneEvent.bind(this), 1, true, 60);
    this._timer.addEvent('hideScene', this._hideSceneEvent.bind(this), 1, true, 60);
    this._timer.addEvent('change', this._changeEvent.bind(this), 1, true, 60);
    this._timer.addEvent('load', this._loadEvent.bind(this), 1, true, 90);
  }

  init() {
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
      case 'change': this._change(); break;
      case 'load': this._load(); break;
    }
  }

  _showScene() {
    this._sceneFader.position.z = 0;
    this._timer.start('showScene');
  }

  _hideScene() {
    this._sceneFader.position.z = 100;
    this._timer.start('hideScene');
  }

  _change() {

  }

  _load() {
    let background = PIXI.Texture.fromImage('static/' + this._action.background + '.jpg');

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
