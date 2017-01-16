import Timer from './Timer'; 

class Sound {
  constructor() {
    this._action = false;
    this._bgm = false;
    this._timer = new Timer();
    this._timer.addEvent('sound', this._soundEvent.bind(this), 1, true);
  }

  handleAction(action) {
    this._action = action;

    if (!this._action.event) {
      this._action.event = 'play';
    }

    switch(this._action.event) {
      case 'bgm': this._setBgm(); break;
      case 'sound': this._sound(); break;
    }
  }

  _setBgm() {
    if (this._action.sound && this._action.sound !== true && this._action.sound !== false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();

          this._createMusic();
        });

        this._bgm.fade(1, 0, 500);
      } else {
        this._createMusic();
      }
    } else if (this._action.sound === false && this._bgm) {
      this._bgm.on('fade', () => {
        this._bgm.unload();
        this._bgm = false;
      });
      this._bgm.fade(1, 0, 500);
    }
  }

  _createMusic() {
    this._bgm = new Howl({
      src: ['static/' + this._action.sound + '.mp3'],
      loop: true
    });
    this._bgm.play();
    this._bgm.fade(0, 1, 500);
  }

  _sound() {
    let sound = new Howl({
      src: ['static/' + this._action.sound + '.mp3'],
      autoplay: true
    });

    this._timer.setRunLimit(Math.ceil(sound._duration * 60));
    this._timer.start('sound', {
      sound: sound
    });
  }

  _soundEvent(event) {
    if (event.over || D.SceneStore.getData('fastForward')) {
      event.params.sound.unload();
      this._timer.destroy('sound');
    }
  }
}

export default new Sound();