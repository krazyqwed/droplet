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

class Character {
  constructor() {
    this._characters = sampleCharacters;

    this._fastForwarded = true;

    this._timer = new Timer();
    this._timer.addEvent('show', this._showEvent.bind(this), 1, true, 30);
    this._timer.addEvent('hide', this._hideEvent.bind(this), 1, true, 30);
    this._timer.addEvent('move', this._moveEvent.bind(this), 1, true, 30);
    this._timer.addEvent('pose', this._poseEvent.bind(this), 1, true, 30);
  }

  init() {
    D.SceneStore.subscribe('skipAsync', (value) => {
      this._timer.over('show');
      this._timer.over('hide');
      this._timer.over('move');
      this._timer.over('pose');
    });

    this._prepareCharacters();
    this._update();
  }

  setAction(action, options, async) {
    this._fastForwarded = false;
    D.CharacterStore.setData('animationRunning', true);

    const character = this.loadCharacterById(options.id);
    let position;

    switch (action) {
      case 'show': position = this._calculatePosition(character.sprite, options); this._showCharacter(character); break;
      case 'hide': position = this._calculatePositionFrom(character.sprite, options); break;
      case 'move': position = this._calculatePositionFrom(character.sprite, options); break;
      case 'pose': this._poseCharacter(character, options); break;
    }

    this._timer.setRunLimit(action, options.duration ? options.duration : 30);
    this._timer.start(action, {
      character: character,
      position: position ? position : false,
      async: async
    });

    if (async) {
      D.CharacterStore.setData('animationRunning', false);
    }
  }

  loadCharacterById(id) {
    return this._characters.filter((character) => {
      if (character.id === id) {
        return character;
      }
    })[0];
  }

  _showCharacter(character) {
    character.sprite.visible = true;
  }

  _poseCharacter(character, options) {
    character.pose = options.pose;

    character.clone.alpha = 0;
    character.clone.position.x = character.sprite.position.x;
    character.clone.position.y = character.sprite.position.y;
    character.clone.setTexture(PIXI.Texture.fromFrame(character.image + '_' + options.pose));
  }

  _prepareCharacters() {
    this._characters.forEach((character, i) => {
      this._characters[i].pose = character.pose ? character.pose : 1;
      this._characters[i].image = character.image;

      this._characters[i].sprite = new PIXI.Sprite();
      this._characters[i].sprite.visible = false;
      this._characters[i].sprite.alpha = 0;
      this._characters[i].sprite.anchor.x = 0.5;
      this._characters[i].sprite.anchor.y = 0.5;
      this._characters[i].sprite.position.x = 0;
      this._characters[i].sprite.position.y = 0;
      this._characters[i].sprite.setTexture(PIXI.Texture.fromFrame(this._characters[i].image + '_' + this._characters[i].pose));
      D.Stage.addChild(this._characters[i].sprite);

      this._characters[i].clone = new PIXI.Sprite();
      this._characters[i].clone.anchor.x = 0.5;
      this._characters[i].clone.anchor.y = 0.5;
      D.Stage.addChild(this._characters[i].clone);
    });
  }

  _calculatePosition(sprite, options) {
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
    position.dest_y = parseInt(1080 * options.position[1] / 100 - sprite.height / 2);

    if (options.from) {
      position.src_x = options.position[0] + options.from[0];
      position.src_y = options.position[1] + options.from[1];

      position.src_x = parseInt(1920 * position.src_x / 100);
      position.src_y = parseInt(1080 * position.src_y / 100 - sprite.height / 2);
    }

    sprite.position.new_x = position.dest_x;
    sprite.position.new_y = position.dest_y;

    return position;
  }

  _calculatePositionFrom(sprite, options) {
    let position = {
      dest_x: options.position[0],
      dest_y: options.position[1],
      src_x: sprite.position.new_x,
      src_y: sprite.position.new_y
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
      position.dest_y = parseInt(1080 * options.position[1] / 100 - sprite.height / 2);
    }

    sprite.position.new_x = position.dest_x;
    sprite.position.new_y = position.dest_y;

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
    let character = event.params.character.sprite;
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    character.alpha = percent;
    character.position.x = newPosition.x;
    character.position.y = newPosition.y;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      character.alpha = 1;
      character.position.x = position.dest_x;
      character.position.y = position.dest_y;

      D.CharacterStore.setData('animationRunning', false);
      this._timer.destroy('show');
    }
  }

  _hideEvent(event) {
    let character = event.params.character.sprite;
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    character.alpha = 1 - percent;
    character.position.x = newPosition.x;
    character.position.y = newPosition.y;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      character.alpha = 0;
      character.position.x = position.dest_x;
      character.position.y = position.dest_y;
      character.visible = false;

      D.CharacterStore.setData('animationRunning', false);
      this._timer.destroy('hide');
    }
  }

  _moveEvent(event) {
    let character = event.params.character.sprite;
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    character.position.x = newPosition.x;
    character.position.y = newPosition.y;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      character.position.x = position.dest_x;
      character.position.y = position.dest_y;

      D.CharacterStore.setData('animationRunning', false);
      this._timer.destroy('move');
    }
  }

  _poseEvent(event) {
    let character = event.params.character.sprite;
    let clone = event.params.character.clone;
    let percent = event.runCount / event.runLimit;

    character.alpha = 1 - percent;
    clone.alpha = percent;

    if (event.over || (this._fastForwarded && !event.params.async)) {
      character.setTexture(PIXI.Texture.fromFrame(event.params.character.image + '_' + event.params.character.pose));
      character.alpha = 1;
      clone.alpha = 0;

      D.CharacterStore.setData('animationRunning', false);
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

export default new Character();
