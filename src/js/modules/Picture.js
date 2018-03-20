import PictureHandler from './PictureHandler';
import CommonHelper from '../helpers/Common';

let samplePictures = [
  {
    id: 1
  }
];


class Picture {
  constructor(data) {
    this._id = data.id;
    this._picture = new PictureHandler('picture_' + this._id);
  }

  getId() {
    return this._id;
  }

  getData() {
    return {
      id: this._id
    };
  }

  isAnimationRunning() {
    return this._picture.isAnimationRunning();
  }

  setAction(action) {
    if (!action.event) {
      action.event = 'show';
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
      ]
    };
  }

  setState(data) {
    data.image = 'picture_' + data.id;

    this._picture.setState(data);
  }

  hide() {
    this._picture.hide();
  }

  forceEndAnimations() {
    this._picture.forceEndAnimations();
  }
}

class PictureCollection {
  constructor() {
    this._pictures = samplePictures;
  }

  init() {
    this._preparePictures();
  }

  handleAction(action) {
    if (D.SceneStore.getData('loadFromSave')) {
      return;
    }

    const picture = this.loadPictureById(action.id);
    picture.setAction(action);
  }

  loadPictureById(id) {
    return this._pictures.filter((picture) => {
      if (picture.getId() === parseInt(id, 10)) {
        return picture;
      }
    })[0];
  }

  hidePictures() {
    this._pictures.forEach((picture) => {
      picture.hide();
    });
  }

  forceEndAnimations() {
    this._pictures.forEach((picture) => {
      picture.forceEndAnimations();
    });
  }

  getState() {
    const pictures = this._pictures.filter(picture => picture.getState().visible);
    return pictures.map(picture => picture.getState());
  }

  setState(data) {
    this.hidePictures();

    CommonHelper.requestTimeout(() => {
      data.forEach((state, i) => {
        this._pictures.forEach((picture) => {
          if (picture.getId() === data[i].id) {
            picture.setState(state);
          }
        });
      });
    }, 500);
  }

  _preparePictures() {
    this._pictures.forEach((picture, i) => {
      this._pictures[i] = new Picture(picture);
    });
  }
}

export default new PictureCollection();