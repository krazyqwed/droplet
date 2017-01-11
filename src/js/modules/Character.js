import Timer from './Timer'; 

let sampleCharacters = [
  {
    id: 1,
    full_name: 'Katsumata Kahori',
    nickname: 'Kahori',
    color: '#454b78',
    image: 'char_1'
  },
  {
    id: 2,
    full_name: 'Tsukamoto Fumiko',
    nickname: 'Fumiko',
    color: '#ca7d78',
    image: 'char_2'
  }
];

class Actor {
  constructor(data) {
    this._id = data.id;
    this._full_name = data.full_name;
    this._nickname = data.nickname;
    this._pose = data.pose ? data.pose : 1;
    this._color = data.color;
    this._image = data.image;
    this._sprite = new PIXI.Sprite();
    this._clone = new PIXI.Sprite();
    this._timer = new Timer();
    this._timer.addEvent('show', this._showEvent.bind(this), 1, true, 30);
    this._timer.addEvent('hide', this._hideEvent.bind(this), 1, true, 30);
    this._timer.addEvent('move', this._moveEvent.bind(this), 1, true, 30);
    this._timer.addEvent('pose', this._poseEvent.bind(this), 1, true, 30);
    this._fastForwarded = true;
    this._animationRunning = false;

    D.SceneStore.subscribe('skipAsync', (value) => {
      this._timer.over('show');
      this._timer.over('hide');
      this._timer.over('move');
      this._timer.over('pose');
    });

    this._init();
  }

  _init() {
    this._sprite.visible = false;
    this._sprite.alpha = 0;
    this._sprite.anchor.x = 0.5;
    this._sprite.anchor.y = 0.5;
    this._sprite.position.x = 0;
    this._sprite.position.y = 0;
    this._sprite.position.z = 1;
    this._sprite.setTexture(PIXI.Texture.fromFrame(this._image + '_' + this._pose));
    D.Stage.addChild(this._sprite);

    this._clone.anchor.x = 0.5;
    this._clone.anchor.y = 0.5;
    this._clone.position.z = 1;
    D.Stage.addChild(this._clone);

    this._update();
  }

  getId() {
    return this._id;
  }

  getData() {
    return {
      id: this._id,
      full_name: this._full_name,
      nickname: this._nickname,
      color: this._color,
      pose: this._pose,
      image: this._image
    };
  }

  isAnimationRunning() {
    return this._animationRunning;
  }

  setAction(action, options, async) {
    this._fastForwarded = false;
    this._animationRunning = true;

    let position;

    switch (action) {
      case 'show': position = this._calculatePosition(options); this._showCharacter(); break;
      case 'hide': position = this._calculatePositionFrom(options); break;
      case 'move': position = this._calculatePositionFrom(options); break;
      case 'pose': this._poseCharacter(options); break;
    }

    this._timer.setRunLimit(action, options.duration ? options.duration : 30);
    this._timer.start(action, {
      position: position ? position : false,
      async: async
    });

    if (async) {
      this._animationRunning = false;
    }
  }

  _showCharacter() {
    this._sprite.visible = true;
  }

  _poseCharacter(options) {
    this._pose = options.pose;

    this._clone.alpha = 0;
    this._clone.position.x = this._sprite.position.x;
    this._clone.position.y = this._sprite.position.y;
    this._clone.setTexture(PIXI.Texture.fromFrame(this._image + '_' + options.pose));
  }

  _calculatePosition(options) {
    let position = {
      dest_x: options.position[0],
      dest_y: options.position[1],
      src_x: options.position[0],
      src_y: options.position[1]
    };

    if (options.position[0] === 'center') {
      options.position[0] = 50;
    }

    if (options.position[1] === 'bottom') {
      options.position[1] = 100;
    }

    position.dest_x = parseInt(1920 * options.position[0] / 100);
    position.dest_y = parseInt(1080 * options.position[1] / 100 - this._sprite.height / 2);

    if (options.from) {
      position.src_x = options.position[0] + options.from[0];
      position.src_y = options.position[1] + options.from[1];

      position.src_x = parseInt(1920 * position.src_x / 100);
      position.src_y = parseInt(1080 * position.src_y / 100 - this._sprite.height / 2);
    }

    this._sprite.position.new_x = position.dest_x;
    this._sprite.position.new_y = position.dest_y;

    return position;
  }

  _calculatePositionFrom(options) {
    let position = {
      dest_x: options.position[0],
      dest_y: options.position[1],
      src_x: this._sprite.position.new_x,
      src_y: this._sprite.position.new_y
    };

    if (options.position[0] === 'center') {
      options.position[0] = 50;
    }

    if (options.position[1] === 'bottom') {
      options.position[1] = 100;
    }

    if (options.relative) {
      position.dest_x = parseInt(position.src_x + 1920 * options.position[0] / 100);
      position.dest_y = parseInt(position.src_y + 1080 * options.position[1] / 100);
    } else {
      position.dest_x = parseInt(1920 * options.position[0] / 100);
      position.dest_y = parseInt(1080 * options.position[1] / 100 - this._sprite.height / 2);
    }

    this._sprite.position.new_x = position.dest_x;
    this._sprite.position.new_y = position.dest_y;

    return position;
  }

  _update() {
    requestAnimationFrame(() => {
      if (!this._fastForwarded && D.SceneStore.getData('fastForward')) {
        this._fastForwarded = true;
      }

      this._update();
    });
  }

  _showEvent(event) {
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    this._sprite.alpha = percent + 0.001;
    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      this._sprite.alpha = 1;
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;

      this._animationRunning = false;
      this._timer.destroy('show');
    }
  }

  _hideEvent(event) {
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    this._sprite.alpha = 1 - percent + 0.001;
    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      this._sprite.alpha = 0.001;
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;
      this._sprite.visible = false;

      this._animationRunning = false;
      this._timer.destroy('hide');
    }
  }

  _moveEvent(event) {
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    this._sprite.position.x = newPosition.x;
    this._sprite.position.y = newPosition.y;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      this._sprite.position.x = position.dest_x;
      this._sprite.position.y = position.dest_y;

      this._animationRunning = false;
      this._timer.destroy('move');
    }
  }

  _poseEvent(event) {
    let percent = event.runCount / event.runLimit;

    this._sprite.alpha = 1 - percent + 0.001;
    this._clone.alpha = percent;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      this._sprite.setTexture(PIXI.Texture.fromFrame(this._image + '_' + this._pose));
      this._sprite.alpha = 1;
      this._clone.alpha = 0.001;

      this._animationRunning = false;
      this._timer.destroy('pose');
    }
  }

  _calculatePositionByPercent(position, percent) {
    let x = position.dest_x + (1 - percent) * (position.src_x - position.dest_x);
    let y = position.dest_y + (1 - percent) * (position.src_y - position.dest_y);

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

  setAction(action, options, async) {
    const character = this.loadCharacterById(options.id);
    character.setAction(action, options, async);
  }

  loadCharacterById(id) {
    return this._characters.filter((character) => {
      if (character.getId() === id) {
        return character;
      }
    })[0];
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
        D.CharacterStore.setData('animationRunning', true);
      } else {
        D.CharacterStore.setData('animationRunning', false);
      }

      this._update();
    });
  }
}

export default new Character();
