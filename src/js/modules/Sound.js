import Timer from './Timer';
import CommonHelper from '../helpers/Common';

class Audio {
  constructor() {
    this._options = false;
    this._sound = false;
    this._timer = new Timer();
    this._timer.addEvent('sound', { onTick: this._soundEvent.bind(this) });
  }

  handleAction(options) {
    this._options = options;

    switch(this._options.event) {
      case 'playSound': this._play(); break;
      case 'stopSound': this._stop(); break;
    }
  }

  getSound() {
    return this._options.sound;
  }

  getState() {
    return this._sound._state !== 'unloaded' && (this._options.loop || this._options.persist) ? this._options : false;
  }

  stopImmidiately() {
    this._sound.unload();
  }

  _play() {
    if (this._sound && !this._options.persist) {
      this._sound.unload();
    } else if (this._sound && this._options.persist) {
      return;
    }

    this._sound = new Howl({
      src: ['static/' + this._options.sound + '.mp3'],
      autoplay: true,
      loop: this._options.loop ? this._options.loop : false
    });
    this._sound.fade(0, (this._options.volume || this._options.volume === 0) ? this._options.volume : 1, 250);

    this._timer.setEventOptions('sound', {
      tickLimit: Math.ceil(this._sound._duration * 60),
      repeat: true
    });
    this._timer.startEvent('sound');
  }

  _stop() {
    this._sound.on('fade', () => {
      this._sound.unload();
    });

    this._sound.fade(this._sound._volume, 0, 500);
    this._timer.endEvent('sound');
  }

  _soundEvent(state) {
    if ((state.over || D.SceneStore.getData('fastForward')) && !this._options.persist) {
      this._sound.on('fade', () => {
        this._sound.unload();
      });

      this._sound.fade(this._sound._volume, 0, 500);
      this._timer.endEvent('sound');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }
}

class Sound {
  constructor() {
    this._bgm = false;
    this._sounds = [];
  }

  handleAction(options) {
    if (D.SceneStore.getData('loadFromSave')) {
      return;
    }

    if (!options.event) {
      options.event = 'playSound';
    }

    switch(options.event) {
      case 'bgm': this._setBgm(options); break;
      case 'playSound': this._playSound(options); break;
      case 'stopSound': this._stopSound(options); break;
    }
  }

  getState() {
    const bgm = {
      sound: this._bgm._src.substring(this._bgm._src.lastIndexOf('/') + 1, this._bgm._src.lastIndexOf('.')),
      volume: this._bgm._volume
    };

    const sounds = this._sounds.map(sound => sound.getState());

    return {
      bgm: bgm,
      sounds: sounds
    };
  }

  setState(data) {
    if (this._bgm) {
      this._bgm.unload();
    }

    this._sounds.forEach((sound) => {
      sound.stopImmidiately();
    });

    this._bgm = false;
    this._sounds = [];

    CommonHelper.requestTimeout(() => {
      this._createMusic(data.bgm);

      data.sounds.forEach((sound) => {
        if (sound) {
          this._playSound(sound);
        }
      });
    }, 1500);
  }

  stopAll() {
    this._sounds.forEach((sound) => {
      sound.handleAction({ event: 'stopSound' });
    });
  }

  _setBgm(options) {
    if (options.sound && options.sound !== false) {
      if (this._bgm) {
        this._bgm.on('fade', () => {
          this._bgm.unload();

          this._createMusic(options);
        });

        this._bgm.fade(this._bgm._volume, 0, 500);
      } else {
        this._createMusic(options);
      }
    } else if (options.sound === false && this._bgm) {
      this._bgm.on('fade', () => {
        this._bgm.unload();
        this._bgm = false;
      });
      this._bgm.fade(this._bgm._volume, 0, 500);
    }
  }

  _createMusic(options) {
    this._bgm = new Howl({
      src: ['static/' + options.sound + '.mp3'],
      loop: true
    });
    this._bgm.play();
    this._bgm.fade(0, (options.volume || options.volume === 0) ? options.volume : 1, 500);
  }

  _playSound(options) {
    let foundSound;

    foundSound = this._sounds.find(sound => sound.getSound() === options.sound);

    if (!foundSound) {
      foundSound = new Audio();
      this._sounds.push(foundSound);
    }

    foundSound.handleAction(options);
  }

  _stopSound(options) {
    const foundSound = this._sounds.find(sound => sound.getSound() === options.sound);
    foundSound.handleAction(options);
  }
}

export default new Sound();