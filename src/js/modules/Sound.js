import Timer from './Timer';
import CommonHelper from '../helpers/Common';

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

  getState() {
    return this._sound._state !== 'unloaded' && (this._action.loop || this._action.persist) ? this._action : false;
  }

  stopImmidiately() {
    this._sound.unload();
  }

  _play() {
    this._sound = new Howl({
      src: ['static/' + this._action.sound + '.mp3'],
      autoplay: true,
      loop: this._action.loop ? this._action.loop : false
    });
    this._sound.fade(0, (this._action.volume || this._action.volume === 0) ? this._action.volume : 1, 250);

    this._timer.setRunLimit(Math.ceil(this._sound._duration * 60));
    this._timer.start('sound');
  }

  _stop() {
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
    if (D.SceneStore.getData('loadFromSave')) {
      return;
    }

    this._action = action;

    if (!this._action.event) {
      this._action.event = 'playSound';
    }

    switch(this._action.event) {
      case 'bgm': this._setBgm(this._action); break;
      case 'playSound': this._playSound(this._action); break;
      case 'stopSound': this._stopSound(this._action); break;
    }
  }

  getState() {
    const bgm = {
      sound: this._bgm._src.substring(this._bgm._src.lastIndexOf('/') + 1, this._bgm._src.lastIndexOf('.')),
      volume: this._bgm._volume
    };

    let sounds = this._sounds.map((sound) => {
      return sound.getState();
    });

    return {
      bgm: bgm,
      sounds: sounds
    };
  }

  setState(data) {
    if (this._bgm) {
      this._bgm.unload();
      delete this._bgm;
    }

    this._sounds.forEach((sound, i) => {
      sound.stopImmidiately();
      delete this._sounds[i];
    });

    CommonHelper.requestTimeout(() => {
      this._createMusic(data.bgm);

      data.sounds.forEach((sound) => {
        if (sound) {
          this._playSound(sound);
        }
      });
    }, 1500);
  }

  _setBgm(action) {
    if (action.sound && action.sound !== true && action.sound !== false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();

          this._createMusic(action);
        });

        this._bgm.fade(this._bgm._volume, 0, 500);
      } else {
        this._createMusic(action);
      }
    } else if (action.sound === false && this._bgm) {
      this._bgm.on('fade', () => {
        this._bgm.unload();
        this._bgm = false;
      });
      this._bgm.fade(this._bgm._volume, 0, 500);
    }
  }

  _createMusic(action) {
    this._bgm = new Howl({
      src: ['static/' + action.sound + '.mp3'],
      loop: true
    });
    this._bgm.play();
    this._bgm.fade(0, (action.volume || action.volume === 0) ? action.volume : 1, 500);
  }

  _playSound(action) {
    let foundSound = this._sounds.some((sound) => {
      if (sound.getSound() === action.sound) {
        sound.handleAction(action);
        return true;
      }
    });

    if (!foundSound) {
      let sound = new Audio();
      sound.handleAction(action);
      this._sounds.push(sound);
    }
  }

  _stopSound(action) {
    this._sounds.some((sound) => {
      if (sound.getSound() === action.sound) {
        sound.handleAction(action);
        return true;
      }
    });
  }
}

export default new Sound();