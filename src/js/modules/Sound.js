import Timer from './Timer'; 

class Sound {
  constructor() {
    this._action = false;
    this._bgm = false;
  }

  handleAction(action) {
    this._action = action;

    if (!this._action.event) {
      this._action.event = 'play';
    }

    switch(this._action.event) {
      case 'bgm': this._bgm(); break;
    }
  }

  _bgm() {
    if (this._action.bgm && this._action.bgm !== true && this._action.bgm !== false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();

          this._createMusic();
        });

        this._bgm.fade(1, 0, 500);
      } else {
        this._createMusic();
      }
    } else if (this._action.bgm === false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();
          this._bgm = false;
        });
        this._bgm.fade(1, 0, 500);
      }
    }
  }

  _createMusic() {
    this._bgm = new Howl({
      src: ['static/' + this._action.bgm + '.mp3'],
      loop: true
    });
    this._bgm.play();
    this._bgm.fade(0, 1, 500);
  }
}

export default new Sound();