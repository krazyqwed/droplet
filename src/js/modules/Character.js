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

const modelHaru = {
  "type": "Live2D Model Setting",
  "name": "haru",
  "model": "static/assets/haru/haru_03.moc",
  "textures":
  [
    "static/assets/haru/haru_03.1024/texture_00.png",
    "static/assets/haru/haru_03.1024/texture_01.png",
    "static/assets/haru/haru_03.1024/texture_02.png"
  ],
  "physics": "static/assets/haru/haru.physics.json",
  "pose": "static/assets/haru/haru.pose.json",
  "expressions":
  [
    {"name": "f01","file": "static/assets/haru/expressions/f01.exp.json"},
    {"name": "f02","file": "static/assets/haru/expressions/f02.exp.json"},
    {"name": "f03","file": "static/assets/haru/expressions/f03.exp.json"},
    {"name": "f04","file": "static/assets/haru/expressions/f04.exp.json"},
    {"name": "f05","file": "static/assets/haru/expressions/f05.exp.json"},
    {"name": "f06","file": "static/assets/haru/expressions/f06.exp.json"},
    {"name": "f07","file": "static/assets/haru/expressions/f07.exp.json"},
    {"name": "f08","file": "static/assets/haru/expressions/f08.exp.json"}
  ],
  "hit_areas":
  [
    {"name": "head", "id": "D_REF.HEAD"},
    {"name": "body", "id": "D_REF.BODY"}
  ],
  "motions":
  {
    "idle":
    [
      {"file": "static/assets/haru/motions/idle_00.mtn", "fade_in": 2000, "fade_out": 2000},
      {"file": "static/assets/haru/motions/idle_01.mtn", "fade_in": 2000, "fade_out": 2000},
      {"file": "static/assets/haru/motions/idle_02.mtn", "fade_in": 2000, "fade_out": 2000}
    ],
    "tap_body":
    [
      { "file": "static/assets/haru/motions/tapBody_00.mtn" , "sound": "static/assets/haru/sounds/tapBody_00.mp3"},
      { "file": "static/assets/haru/motions/tapBody_01.mtn" , "sound": "static/assets/haru/sounds/tapBody_01.mp3"},
      { "file": "static/assets/haru/motions/tapBody_02.mtn" , "sound": "static/assets/haru/sounds/tapBody_02.mp3"}
    ],
    "pinch_in":
    [
      { "file": "static/assets/haru/motions/pinchIn_00.mtn", "sound": "static/assets/haru/sounds/pinchIn_00.mp3" }
    ],
    "pinch_out":
    [
      { "file": "static/assets/haru/motions/pinchOut_00.mtn", "sound": "static/assets/haru/sounds/pinchOut_00.mp3" }
    ],
    "shake":
    [
      { "file": "static/assets/haru/motions/shake_00.mtn", "sound": "static/assets/haru/sounds/shake_00.mp3", "fade_in": 500 }
    ],
    "flick_head":
    [
      { "file": "static/assets/haru/motions/flickHead_00.mtn" }
    ]
  }
};

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

  setAction(action) {
    if (!action.event) {
      action.event = 'show';
    }

    switch (action.event) {
      case 'pose': {
        this._pose = action.pose;

        action.event = 'switch';
        action.image = 'char_' + this._id + '_' + this._pose;
        
        break;
      }
    }

    this._picture.setAction(action);
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

  loadCharacterById(id) {
    return this._characters.filter((character) => {
      if (character.getId() === parseInt(id, 10)) {
        return character;
      }
    })[0];
  }

  hideCharacters() {
    this._characters.forEach((character) => {
      character.hide();
    });
  }

  forceEndAnimations() {
    this._characters.forEach((character) => {
      character.forceEndAnimations();
    });
  }

  getState() {
    return this._characters.map((character) => {
      return character.getState();
    });
  }

  setState(data) {
    CommonHelper.requestTimeout(() => {
      data.forEach((state, i) => {
        this._characters.forEach((character) => {
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

        const live2dSprite = new PIXI.Live2DSprite(modelHaru, {
      debugLog: false,
      randomMotion: true,
      eyeBlink: true
    });
    live2dSprite.position.z = 10;
    D.Stage.addChild(live2dSprite);

    live2dSprite.adjustScale(0, 0, 0.5);
    live2dSprite.adjustTranslate(0.4, 0);
    live2dSprite.startRandomMotion('idle');
    live2dSprite.on('mousemove', (evt) => {
      const point = evt.data.global;
      live2dSprite.setViewPoint(point.x, point.y);
    });

    document.addEventListener('click', () => {
      live2dSprite.startMotion('flick_head', 0);
    });
  }
}

export default new CharacterCollection();
