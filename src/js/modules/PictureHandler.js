import Timer from './Timer'; 
import CommonHelper from '../helpers/Common';

class PictureHandler {
  constructor(image) {
    this._options = false;

    this._image = PIXI.Texture.fromFrame(image);
    this._sprite = new PIXI.Sprite();
    this._sprite.setTexture(this._image);
    this._clone = new PIXI.Sprite();
    this._mask = new PIXI.Sprite();
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

    this._mask.alpha = 1;
    this._mask.anchor.x = 0.5;
    this._mask.anchor.y = 0.5;
    this._mask.position.z = 3;
    D.Stage.addChild(this._mask);
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
    this._sprite.mask = this._mask;

    this._clone.alpha = 0.001;
    this._clone.position.z = 3;
    this._clone.position.x = this._sprite.position.x;
    this._clone.position.y = this._sprite.position.y;
    this._clone.setTexture(this._image);

    const imageWidth = this._image.frame.width;
    const imageHeight = this._image.frame.height;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = imageWidth;
    maskCanvas.height = imageHeight;
    const maskContext = maskCanvas.getContext('2d');
    maskContext.drawImage(this._image.baseTexture.source, this._image.frame.x, this._image.frame.y, this._image.frame.width, this._image.frame.height, 0, 0, this._image.frame.width, this._image.frame.height);
    const imgPixels = maskContext.getImageData(0, 0, imageWidth, imageHeight);

    for (let y = 0; y < imageHeight; ++y){
      for (let x = 0; x < imageWidth; ++x){
        let i = (y * 4) * imageWidth + x * 4;
        imgPixels.data[i] = 255;
        imgPixels.data[i + 1] = 255;
        imgPixels.data[i + 2] = 255;
      }
    }

    maskContext.putImageData(imgPixels, 0, 0, 0, 0, imageWidth, imageHeight);
    const maskImage = new Image();
    maskImage.src = maskCanvas.toDataURL();

    console.log(maskImage.src);

    this._mask.position.x = this._sprite.position.x;
    this._mask.position.y = this._sprite.position.y;
    this._mask.setTexture(new PIXI.Texture(new PIXI.BaseTexture(maskImage)));

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
    const percent = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByPercent(position, percent);

    this._sprite.alpha = percent + 0.001;
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
    const percent = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByPercent(position, percent);

    this._sprite.alpha = 1 - percent + 0.001;
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
    const percent = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByPercent(position, percent);

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
    const percent = event.runCount / event.runLimit;

    //this._sprite.alpha = 1 - percent + 0.001;
    //this._clone.alpha = percent + 0.001;

    if (event.over) {
      //this._sprite.setTexture(this._image);
      this._sprite.alpha = 1;
      this._sprite.position.z = 3;
      //this._sprite.mask = false;
      this._clone.alpha = 0.001;
      this._clone.position.z = 2;

      this._animationRunning = false;
      this._timer.destroy('switch');
      D.SceneStore.triggerCallback('autoContinue');
    }
  }

  _calculatePositionByPercent(position, percent) {
    const x = position.dest_x + (1 - percent) * (position.src_x - position.dest_x);
    const y = position.dest_y + (1 - percent) * (position.src_y - position.dest_y);

    return {
      x: x,
      y: y
    };
  }
}

export default PictureHandler;