import Timer from './Timer'; 
import CommonHelper from '../helpers/Common';

class PictureHandler {
  constructor(image) {
    this._options = false;

    this._image = PIXI.Texture.fromFrame(image);
    this._sprite = new PIXI.Sprite();
    this._sprite.setTexture(this._image);
    this._clone = new PIXI.Sprite();
    this._timer = new Timer();
    this._animationRunning = false;
    this._timer.addEvent('show', {
      callback: this._showEvent.bind(this),
      runLimit: 30
    });
    this._timer.addEvent('hide', {
      callback: this._hideEvent.bind(this),
      runLimit: 30
    });
    this._timer.addEvent('move', {
      callback: this._moveEvent.bind(this),
      runLimit: 30
    });
    this._timer.addEvent('switch', {
      callback: this._switchEvent.bind(this),
      runLimit: 30
    });

    this._init();
  }

  _init() {
    this._sprite.visible = false;
    this._sprite.alpha = 0.001;
    this._sprite.anchor.x = 0.5;
    this._sprite.anchor.y = 0.5;
    this._sprite.position.x = 0;
    this._sprite.position.y = 0;
    this._sprite.position.z = 3;
    D.Stage.addChild(this._sprite);

    this._clone.alpha = 0.001;
    this._clone.anchor.x = 0.5;
    this._clone.anchor.y = 0.5;
    this._clone.position.z = 3;
    D.Stage.addChild(this._clone);
  }

  isAnimationRunning() {
    return this._animationRunning;
  }

  setAction(options) {
    this._options = options;
    this._animationRunning = true;

    let position;

    if (!this._options.event) {
      this._options.event = 'show';
    }

    switch (options.event) {
      case 'show': position = this._calculatePosition(); this._show(options.image); break;
      case 'hide': position = this._calculatePositionFrom(); break;
      case 'move': position = this._calculatePositionFrom(); break;
      case 'switch': this._switch(options.image); break;
    }

    this._timer.setRunLimit(this._options.event, this._options.duration ? this._options.duration : 30);
    this._timer.start(this._options.event, {}, {
      position: position ? position : false
    });
  }

  hide() {
    this._sprite.visible = false;
    this._clone.visible = false;
  }

  forceEndAnimations() {
    this._timer.over('show');
    this._timer.over('hide');
    this._timer.over('move');
    this._timer.over('switch');
  }

  getState() {
    return {
      visible: this._sprite.visible,
      position: [
        this._sprite.position.x,
        this._sprite.position.y,
        this._sprite.position.new_x,
        this._sprite.position.new_y
      ]
    };
  }

  setState(data) {
    this._sprite.setTexture(PIXI.Texture.fromFrame(data.image));
    this._sprite.position.x = data.position[0];
    this._sprite.position.y = data.position[1];
    this._sprite.position.new_x = data.position[2];
    this._sprite.position.new_y = data.position[3];
    this._sprite.alpha = data.visible ? 1 : 0.001;
    this._sprite.visible = data.visible;
  }

  _show(image = false) {
    if (image) {
      this._image = PIXI.Texture.fromFrame(image);
      this._sprite.setTexture(this._image);
    }

    this._sprite.alpha = 0.001;
    this._sprite.position.z = 3;

    this._sprite.visible = true;
    this._clone.visible = true;
  }

  _switch(image) {
    this._image = PIXI.Texture.fromFrame(image);
    this._sprite.position.z = 2;

    this._clone.alpha = 0.001;
    this._clone.position.z = 3;
    this._clone.position.x = this._sprite.position.x;
    this._clone.position.y = this._sprite.position.y;
    this._clone.setTexture(this._image);

    this._clone.visible = true;
  }

  _calculatePosition() {
    let position = {
      dest_x: this._options.position[0],
      dest_y: this._options.position[1],
      src_x: this._options.position[0],
      src_y: this._options.position[1]
    };

    if (this._options.position[0] === 'center') {
      this._options.position[0] = 50;
    }

    if (this._options.position[1] === 'bottom') {
      this._options.position[1] = 100;
    }

    position.dest_x = parseInt(1920 * this._options.position[0] / 100);
    position.dest_y = parseInt(1080 * this._options.position[1] / 100 - this._sprite.height / 2);

    if (this._options.from) {
      position.src_x = this._options.position[0] + this._options.from[0];
      position.src_y = this._options.position[1] + this._options.from[1];

      position.src_x = parseInt(1920 * position.src_x / 100);
      position.src_y = parseInt(1080 * position.src_y / 100 - this._sprite.height / 2);
    }

    this._sprite.position.new_x = position.dest_x;
    this._sprite.position.new_y = position.dest_y;

    return position;
  }

  _calculatePositionFrom() {
    if (!this._options.position) {
      this._options.position = [0, 0];
    }

    let position = {
      dest_x: this._options.position[0],
      dest_y: this._options.position[1],
      src_x: this._sprite.position.new_x,
      src_y: this._sprite.position.new_y
    };

    if (this._options.position[0] === 'center') {
      this._options.position[0] = 50;
    }

    if (this._options.position[1] === 'bottom') {
      this._options.position[1] = 100;
    }

    if (this._options.absolute) {
      position.dest_x = parseInt(1920 * this._options.position[0] / 100);
      position.dest_y = parseInt(1080 * this._options.position[1] / 100 - this._sprite.height / 2);
    } else {
      position.dest_x = parseInt(position.src_x + 1920 * this._options.position[0] / 100);
      position.dest_y = parseInt(position.src_y + 1080 * this._options.position[1] / 100);
    }

    this._sprite.position.new_x = position.dest_x;
    this._sprite.position.new_y = position.dest_y;

    return position;
  }

  _showEvent(event) {
    const position = event.params.position;
    const progress = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByProgress(position, progress);

    this._sprite.alpha = progress + 0.001;
    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;

    if (event.over) {
      this._sprite.alpha = 1;
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;

      this._animationRunning = false;
      this._timer.destroy('show');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _hideEvent(event) {
    const position = event.params.position;
    const progress = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByProgress(position, progress);

    this._sprite.alpha = 1 - progress + 0.001;
    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;

    if (event.over) {
      this._sprite.alpha = 0.001;
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;
      this._sprite.visible = false;

      this._animationRunning = false;
      this._timer.destroy('hide');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _moveEvent(event) {
    const position = event.params.position;
    const progress = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByProgress(position, progress);

    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;
    this._clone.position.x = newPosition.x;
    this._clone.position.y = newPosition.y;

    if (event.over) {
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;
      this._clone.position.x = position.dest_x;
      this._clone.position.y = position.dest_y;

      this._animationRunning = false;
      this._timer.destroy('move');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _switchEvent(event) {
    const progress = event.runCount / event.runLimit;

    this._sprite.alpha = 1 - progress + 0.001; 
    const clampAlpha = Math.min(Math.max(this._sprite.alpha, 0), 0.97); 
    this._clone.alpha = (0.97 - clampAlpha) / (1 - clampAlpha); 

    if (event.over) {
      this._sprite.setTexture(this._image);
      this._sprite.alpha = 1;
      this._sprite.position.z = 3;
      this._clone.alpha = 0.001;
      this._clone.position.z = 2;

      this._animationRunning = false;
      this._timer.destroy('switch');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _calculatePositionByProgress(position, progress) {
    const x = position.dest_x + (1 - progress) * (position.src_x - position.dest_x);
    const y = position.dest_y + (1 - progress) * (position.src_y - position.dest_y);

    return {
      x: x,
      y: y
    };
  }
}

export default PictureHandler;