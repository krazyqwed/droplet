import PictureHandler from './PictureHandler';
import CommonHelper from '../helpers/Common';

let sampleCharacters = [
  {
    id: 1,
    fullName: 'Katsumata Kahori',
    nickname: 'Kahori',
    color: '#a8adcd',
    bgColor: '#454b78'
  },
  {
    id: 2,
    fullName: 'Tsukamoto Fumiko',
    nickname: 'Fumiko',
    color: '#fc5045',
    bgColor: '#ca7d78'
  }
];

class Character {
  constructor(data) {
    this._action = false;
    this._id = data.id;
    this._fullName = data.fullName;
    this._nickname = data.nickname;
    this._pose = data.pose ? data.pose : 1;
    this._color = data.color;
    this._bgColor = data.bgColor;
    this._picture = new PictureHandler('char_' + this._id + '_' + this._pose);
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
      pose: this._pose
    };
  }

  isAnimationRunning() {
    return this._picture.isAnimationRunning();
  }

  setAction(options) {
    if (!options.event) {
      options.event = 'show';
    }

    this._pose = options.pose || this._pose;
    options.image = 'char_' + this._id + '_' + this._pose;

    switch (options.event) {
      case 'pose': options.event = 'switch'; break;
    }

    this._picture.setAction(options);
  }

  getState() {
    const picture = this._picture.getState();

    return {
      id: this._id,
      visible: picture.visible,
      position: [
        picture.position[0],
        picture.position[1],
        picture.position[2],
        picture.position[3]
      ],
      pose: this._pose
    };
  }

  setState(data) {
    this._pose = data.pose;
    data.image = 'char_' + data.id + '_' + data.pose;

    this._picture.setState(data);
  }

  hide() {
    this._picture.hide();
  }

  forceEndAnimations() {
    this._picture.forceEndAnimations();
  }
}

class CharacterCollection {
  constructor() {
    this._characters = sampleCharacters;
  }

  init() {
    this._prepareCharacters();
  }

  handleAction(action) {
    if (D.SceneStore.getData('loadFromSave')) {
      return;
    }

    const character = this.loadCharacterById(action.id);
    character.setAction(action);
  }

  loadCharacterById(characterId) {
    return this._characters.find(character => character.getId() === parseInt(characterId, 10));
  }

  hideCharacters() {
    this._characters.forEach(character => {
      character.hide();
    });
  }

  forceEndAnimations() {
    this._characters.forEach(character => {
      character.forceEndAnimations();
    });
  }

  getState() {
    const characters = this._characters.filter(character => character.getState().visible);
    return characters.map(character => character.getState());
  }

  setState(data) {
    this.hideCharacters();

    CommonHelper.requestTimeout(() => {
      data.forEach((state, i) => {
        this._characters.forEach(character => {
          if (character.getId() === data[i].id) {
            character.setState(state);
          }
        });
      });
    }, 500);
  }

  _prepareCharacters() {
    this._characters.forEach((character, i) => {
      this._characters[i] = new Character(character);
    });
  }
}

export default new CharacterCollection();
