import Timer from './Timer'; 

class Background {
  constructor() {
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

    this._dom = {};
    this._dom.fader = document.querySelector('.js_fader');

    this._timer = new Timer();
    this._timer.addEvent('load', this._loadEvent.bind(this), 1, true, 90);
  }

  init() {
    D.Stage.addChild(this._background);
    D.Stage.addChild(this._backgroundClone);
  }

  handleAction(action) {
    this._action = action;

    if (!this._action.event) {
      this._action.event = 'show';
    }

    switch(this._action.event) {
      case 'load': this._load(); break;
    }
  }

  _load() {
    let background = PIXI.Texture.fromImage('static/' + this._action.background + '.jpg');

    this._backgroundClone.setTexture(this._background.texture);
    this._backgroundClone.alpha = 1;
    this._backgroundClone.position.z = 1;

    this._background.setTexture(background);
    this._background.alpha = 0.001;
    this._background.position.z = 0;

    this._timer.start('load');
  }

  _loadEvent(event) {
    if (event.runCount === 1) {
      this._dom.fader.classList.add('d_fader--visible');
    } else if (event.runCount === 30) {
      this._background.alpha = 1;
      this._background.position.z = 1;
      this._backgroundClone.alpha = 0.001;
      this._backgroundClone.position.z = 0;
    } else if (event.runCount === 60) {
      this._dom.fader.classList.remove('d_fader--visible');
    }

    if (event.over) {
      this._timer.destroy('load');
    }
  }
}

export default new Background();
