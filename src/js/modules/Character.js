import Timer from './Timer'; 

let sampleCharacters = [
  {
    id: 1,
    full_name: 'Katsumata Kahori',
    nickname: 'Kahori',
    name_color: '#DCBFFF',
    image: 'char_1',
    text_color: '#DCBFFF'
  },
  {
    id: 2,
    full_name: 'Tsukamoto Fumiko',
    nickname: 'Fumiko',
    name_color: '#FFDFBF',
    image: 'char_2',
    text_color: '#FFDFBF'
  }
];

class Character {
  constructor() {
    this._characters = sampleCharacters;

    this._fastForwarded = true;

    this._timer = new Timer();
    this._timer.addEvent('show', this._showEvent.bind(this), 1, true, 30);
    this._timer.addEvent('hide', this._showEvent.bind(this), 1, true, 30);
    this._timer.addEvent('move', this._moveEvent.bind(this), 1, true, 30);
  }

  init() {
    this._prepareCharacters();
    this._update();
  }

  showCharacter(options) {
    this._fastForwarded = false;
    D.CharacterStore.setData('animationRunning', true);

    const character = this._loadCharacterById(options.id);
    const position = this._calculatePosition(character.sprite, options);

    character.sprite.visible = true;

    this._timer.start('show', {
      character: character,
      position: position
    });
  }

  hideCharacter(options) {
    this._fastForwarded = false;
    D.CharacterStore.setData('animationRunning', true);

    const character = this._loadCharacterById(options.id);
    const position = this._calculatePosition(character.sprite, options);

    this._timer.start('hide', {
      character: character,
      position: position
    });
  }

  moveCharacter(options) {
    this._fastForwarded = false;
    D.CharacterStore.setData('animationRunning', true);

    const character = this._loadCharacterById(options.id);
    const position = this._calculatePositionFrom(character.sprite, options);
    console.log(position);

    this._timer.start('move', {
      character: character,
      position: position
    });
  }

  _prepareCharacters() {
    this._characters.forEach((char, i) => {
      let sprite = new PIXI.Sprite.fromImage(char.image);
      
      sprite.visible = false;
      sprite.alpha = 0;
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.5;
      sprite.position.x = 0;
      sprite.position.y = 0;
      sprite.setTexture(PIXI.Texture.fromFrame(char.image + '_' + 1));

      D.Stage.addChild(sprite);

      this._characters[i].sprite = sprite;
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

    return position;
  }

  _calculatePositionFrom(sprite, options) {
    let position = {
      dest_x: options.position[0],
      dest_y: options.position[1],
      src_x: sprite.position.x,
      src_y: sprite.position.y
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

    return position;
  }

  _loadCharacterById(id) {
    return this._characters.filter((char) => {
      if (char.id === id) {
        return char;
      }
    })[0];
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

    if (event.over || this._fastForwarded) {
      character.alpha = 1;
      character.position.x = position.dest_x;
      character.position.y = position.dest_y;

      D.CharacterStore.setData('animationRunning', false);
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

    if (event.over || this._fastForwarded) {
      character.alpha = 0;
      character.position.x = position.dest_x;
      character.position.y = position.dest_y;
      character.sprite.visible = false;

      D.CharacterStore.setData('animationRunning', false);
    }
  }

  _moveEvent(event) {
    let character = event.params.character.sprite;
    let position = event.params.position;
    let percent = event.runCount / event.runLimit;
    let newPosition = this._calculatePositionByPercent(position, percent);

    character.position.x = newPosition.x;
    character.position.y = newPosition.y;

    if (event.over || this._fastForwarded) {
      character.position.x = position.dest_x;
      character.position.y = position.dest_y;

      D.CharacterStore.setData('animationRunning', false);
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
