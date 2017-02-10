import SystemHelper from '../helpers/System';
import CommonHelper from '../helpers/Common';

class Save {
  constructor() {
    this._saves = this._getSaves();
    this._dom = {};
    this._dom.wrap = document.querySelector('.js_save');
    this._dom.content = document.querySelector('.js_save_content');
    this._events = {};
    this._events.show = this._showEvent.bind(this);
  }

  load(data) {
    D.SceneStore.setData('loadFromSave', true);
    D.Story.loadScene(data.state.scene, data.state.keyframe);
    D.Character.restoreCharacters(data.state.characters);

    this._hide();
  }

  show() {
    this._dom.content.innerHTML = '';
    this._dom.wrap.style.removeProperty('display');

/*
    localStorage.setItem('d_saves', JSON.stringify([
      {
        date: new Date().toString(),
        thumbnail: 'data:image/png;base64',
        state: {
          scene: D.Scene.getCurrentScene(),
          keyframe: D.Scene.getCurrentKeyframe(),
          characters: D.Character.getCurrentCharacters(),
          variables: D.Variable.getCurrentVariables()
        }
      }
    ]));
*/

    this._generateSaves();

    requestAnimationFrame(() => {
      this._dom.wrap.classList.add('d_save-wrap--visible');
      window.addEventListener('keydown', this._events.show);
    });
  }

  _showEvent(event) {
    if (event.which === 27) {
      event.preventDefault();
      this._hide();
    }
  }

  _hide() {
    this._dom.wrap.classList.remove('d_save-wrap--visible');
    CommonHelper.requestTimeout(() => {
      this._dom.wrap.style.display = 'none';
    }, 300);

    window.removeEventListener('keydown', this._events.show);
  }

  _save() {
    
  }

  _getSaves() {
    if (SystemHelper.isElectron()) {

    } else {
      return JSON.parse(localStorage.getItem('d_saves'));
    }
  }

  _generateSaves() {
    let slots = [];

    for (let i = 0; i < 9; ++i) {
      const saveTile = document.createElement('div');
      saveTile.classList.add('d_save__tile');
      this._dom.content.appendChild(saveTile);

      slots.push(saveTile);
    }

    this._saves.forEach((save, i) => {
      slots[i].style.backgroundImage = 'url("' + save.thumbnail + '")';

      slots[i].addEventListener('click', this.load.bind(this, save));
    });
  }
}

export default new Save();
