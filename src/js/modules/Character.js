import Timer from './Timer'; 

let sampleCharacters = [
  {
    id: 1,
    fullName: 'Katsumata Kahori',
    nickname: 'Kahori',
    color: '#a8adcd',
    bgColor: '#454b78',
    image: 'char_1'
  },
  {
    id: 2,
    fullName: 'Tsukamoto Fumiko',
    nickname: 'Fumiko',
    color: '#fc5045',
    bgColor: '#ca7d78',
    image: 'char_2'
  }
];

class Actor {
  constructor(data) {
    this._action = false;
    this._id = data.id;
    this._fullName = data.fullName;
    this._nickname = data.nickname;
    this._pose = data.pose ? data.pose : 1;
    this._color = data.color;
    this._bgColor = data.bgColor;
    this._image = data.image;
    this._sprite = new PIXI.Sprite();
    this._clone = new PIXI.Sprite();
    this._timer = new Timer();
    this._timer.addEvent('show', this._showEvent.bind(this), 1, true, 30);
    this._timer.addEvent('hide', this._hideEvent.bind(this), 1, true, 30);
    this._timer.addEvent('move', this._moveEvent.bind(this), 1, true, 30);
    this._timer.addEvent('pose', this._poseEvent.bind(this), 1, true, 30);
    this._animationRunning = false;

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
    this._sprite.setTexture(PIXI.Texture.fromFrame(this._image + '_' + this._pose));
    D.Stage.addChild(this._sprite);

    this._clone.anchor.x = 0.5;
    this._clone.anchor.y = 0.5;
    this._clone.position.z = 3;
    D.Stage.addChild(this._clone);
  }

  getId() {
    return this._id;
  }

  getData() {
    return {
      id: this._id,
      fullName: this._fullName,
      nickname: this._nickname,
      color: this._color,
      bgColor: this._bgColor,
      pose: this._pose,
      image: this._image
    };
  }

  isAnimationRunning() {
    return this._animationRunning;
  }

  setAction(action) {
    D.SceneStore.setData('characterRunning', true);
    this._action = action;
    this._animationRunning = true;

    let position;

    if (!this._action.event) {
      this._action.event = 'show';
    }

    switch (action.event) {
      case 'show': position = this._calculatePosition(); this._showCharacter(); break;
      case 'hide': position = this._calculatePositionFrom(); break;
      case 'move': position = this._calculatePositionFrom(); break;
      case 'pose': this._poseCharacter(); break;
    }

    this._timer.setRunLimit(this._action.event, this._action.duration ? this._action.duration : 30);
    this._timer.start(this._action.event, {
      position: position ? position : false
    });
  }

  hideCharacter() {
    this._sprite.visible = false;
    this._clone.visible = false;
  }

  _showCharacter() {
    this._pose = this._action.pose;
    this._sprite.setTexture(PIXI.Texture.fromFrame(this._image + '_' + this._pose));
    this._sprite.alpha = 0.001;
    this._sprite.position.z = 3;

    this._sprite.visible = true;
    this._clone.visible = true;
  }

  _poseCharacter() {
    this._pose = this._action.pose;

    this._sprite.position.z = 2;

    this._clone.alpha = 0.001;
    this._clone.position.z = 3;
    this._clone.position.x = this._sprite.position.x;
    this._clone.position.y = this._sprite.position.y;
    this._clone.setTexture(PIXI.Texture.fromFrame(this._image + '_' + this._pose));
  }

  _calculatePosition() {
    let position = {
      dest_x: this._action.position[0],
      dest_y: this._action.position[1],
      src_x: this._action.position[0],
      src_y: this._action.position[1]
    };

    if (this._action.position[0] === 'center') {
      this._action.position[0] = 50;
    }

    if (this._action.position[1] === 'bottom') {
      this._action.position[1] = 100;
    }

    position.dest_x = parseInt(1920 * this._action.position[0] / 100);
    position.dest_y = parseInt(1080 * this._action.position[1] / 100 - this._sprite.height / 2);

    if (this._action.from) {
      position.src_x = this._action.position[0] + this._action.from[0];
      position.src_y = this._action.position[1] + this._action.from[1];

      position.src_x = parseInt(1920 * position.src_x / 100);
      position.src_y = parseInt(1080 * position.src_y / 100 - this._sprite.height / 2);
    }

    this._sprite.position.new_x = position.dest_x;
    this._sprite.position.new_y = position.dest_y;

    return position;
  }

  _calculatePositionFrom() {
    if (!this._action.position) {
      this._action.position = [0, 0];
    }

    let position = {
      dest_x: this._action.position[0],
      dest_y: this._action.position[1],
      src_x: this._sprite.position.new_x,
      src_y: this._sprite.position.new_y
    };

    if (this._action.position[0] === 'center') {
      this._action.position[0] = 50;
    }

    if (this._action.position[1] === 'bottom') {
      this._action.position[1] = 100;
    }

    if (this._action.absolute) {
      position.dest_x = parseInt(1920 * this._action.position[0] / 100);
      position.dest_y = parseInt(1080 * this._action.position[1] / 100 - this._sprite.height / 2);
    } else {
      position.dest_x = parseInt(position.src_x + 1920 * this._action.position[0] / 100);
      position.dest_y = parseInt(position.src_y + 1080 * this._action.position[1] / 100);
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

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sprite.alpha = 1;
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;

      this._animationRunning = false;
      this._timer.destroy('show');
    }
  }

  _hideEvent(event) {
    const position = event.params.position;
    const percent = event.runCount / event.runLimit;
    const newPosition = this._calculatePositionByPercent(position, percent);

    this._sprite.alpha = 1 - percent + 0.001;
    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sprite.alpha = 0.001;
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;
      this._sprite.visible = false;

      this._animationRunning = false;
      this._timer.destroy('hide');
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

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;
      this._clone.position.x = position.dest_x;
      this._clone.position.y = position.dest_y;

      this._animationRunning = false;
      this._timer.destroy('move');
    }
  }

  _poseEvent(event) {
    const percent = event.runCount / event.runLimit;

    this._sprite.alpha = 1 - percent + 0.001;
    const clampAlpha = Math.min(Math.max(this._sprite.alpha, 0), 0.97);
    this._clone.alpha = (0.97 - clampAlpha) / (1 - clampAlpha);

    if (event.over || D.SceneStore.getData('fastForward')) {
      this._sprite.setTexture(PIXI.Texture.fromFrame(this._image + '_' + this._pose));
      this._sprite.alpha = 1;
      this._sprite.position.z = 3;
      this._clone.alpha = 0.001;
      this._clone.position.z = 2;

      this._animationRunning = false;
      this._timer.destroy('pose');
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

class Character {
  constructor() {
    this._characters = sampleCharacters;
  }

  init() {
    this._prepareCharacters();
    this._update();
  }

  handleAction(action) {
    const character = this.loadCharacterById(action.id);
    character.setAction(action);
  }

  loadCharacterById(id) {
    return this._characters.filter((character) => {
      if (character.getId() === id) {
        return character;
      }
    })[0];
  }

  hideCharacters() {
    this._characters.forEach((character, i) => {
      this._characters[i].hideCharacter();
    });
  }

  _isAnimationRunning() {
    let animationRunning = false;

    this._characters.forEach((character, i) => {
      if (character.isAnimationRunning()) {
        animationRunning = true;
      }
    });

    return animationRunning;
  }

  _prepareCharacters() {
    this._characters.forEach((character, i) => {
      this._characters[i] = new Actor(character);
    });
  }

  _update() {
    requestAnimationFrame(() => {
      if (this._isAnimationRunning()) {
        D.SceneStore.setData('characterRunning', true);
      } else {
        D.SceneStore.setData('characterRunning', false);
      }

      this._update();
    });
  }
}

export default new Character();
