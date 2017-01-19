import Timer from './Timer'; 

class Audio {
  constructor() {
    this._action = false;
    this._sound = false;
    this._timer = new Timer();
    this._timer.addEvent('sound', this._soundEvent.bind(this), 1, true);
  }

  handleAction(action) {
    this._action = action;

    switch(this._action.event) {
      case 'playSound': this._play(); break;
      case 'stopSound': this._stop(); break;
    }
  }

  getSound() {
    return this._action.sound;
  }

  _play() {
    this._sound = new Howl({
      src: ['static/' + this._action.sound + '.mp3'],
      autoplay: true,
      loop: this._action.loop ? this._action.loop : false
    });
    this._sound.fade(0, this._action.volume, 250);

    this._timer.setRunLimit(Math.ceil(this._sound._duration * 60));
    this._timer.start('sound');
  }

  _stop() {
    console.log(this._sound);
    this._sound.on('fade', () => {
      this._sound.unload();
    });

    this._sound.fade(this._sound._volume, 0, 500);
    this._timer.destroy('sound');
  }

  _soundEvent(event) {
    if ((event.over || D.SceneStore.getData('fastForward')) && !this._action.persist) {
      this._sound.on('fade', () => {
        this._sound.unload();
      });

      this._sound.fade(this._sound._volume, 0, 500);
      this._timer.destroy('sound');
    }
  }
}

class Sound {
  constructor() {
    this._action = false;
    this._bgm = false;
    this._sounds = [];
  }

  handleAction(action) {
    this._action = action;

    if (!this._action.event) {
      this._action.event = 'playSound';
    }

    switch(this._action.event) {
      case 'bgm': this._setBgm(); break;
      case 'playSound': this._playSound(); break;
      case 'stopSound': this._stopSound(); break;
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

  _playSound() {
    let foundSound = this._sounds.some((sound) => {
      if (sound.getSound() === this._action.sound) {
        sound.handleAction(this._action);
        return true;
      }
    });

    if (!foundSound) {
      let sound = new Audio();
      sound.handleAction(this._action);
      this._sounds.push(sound);
    }
  }

  _stopSound() {
    this._sounds.some((sound) => {
      if (sound.getSound() === this._action.sound) {
        sound.handleAction(this._action);
        return true;
      }
    });
  }
}

export default new Sound();