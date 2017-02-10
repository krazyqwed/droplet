import SystemHelper from '../helpers/System';
import CommonHelper from '../helpers/Common';

class Save {
  constructor() {
    this._isSave = true;
    this._selectedSaveSlot = 0;
    this._dom = {};
    this._dom.wrap = document.querySelector('.js_save');
    this._dom.content = document.querySelector('.js_save_content');
    this._events = {};
    this._events.show = this._showEvent.bind(this);
  }

  init() {
    D.EngineStore.subscribe('takeScreenshot', this._save.bind(this));
  }

  load(data) {
    D.SceneStore.setData('loadFromSave', true);
    D.Story.loadScene(data.state.scene, data.state.keyframe);
    D.Character.restoreCharacters(data.state.characters);

    CommonHelper.requestTimeout(() => {
      this._hide();
    }, 500);
  }

  show(isSave) {
    this._saves = this._getSaves();
    this._isSave = !isSave || isSave === false ? false : true;
    this._dom.content.innerHTML = '';
    this._dom.wrap.style.removeProperty('display');

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
    let img = document.createElement('img');
    img.src = D.Renderer.view.toDataURL('image/jpeg', 1);

    var canvas = document.createElement("canvas");
    canvas.width = 1920 / 4;
    canvas.height = 1080 / 4;

    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    let currentSaves = JSON.parse(localStorage.getItem('d_saves'));

    const saveData = {
      date: new Date().toString(),
      thumbnail: canvas.toDataURL('image/jpeg', 1),
      title: D.Scene.getCurrentScene().title,
      state: {
        scene: D.Scene.getCurrentScene().id,
        keyframe: D.Scene.getCurrentKeyframe(),
        characters: D.Character.getCurrentCharacters(),
        variables: D.Variable.getCurrentVariables(),
        background: false,
        fade: false,
        music: false,
        sounds: false
      }
    };

    currentSaves[this._selectedSaveSlot] = saveData;

    localStorage.setItem('d_saves', JSON.stringify(currentSaves));

    this._hide();
  }

  _getSaves() {
    if (SystemHelper.isElectron()) {

    } else {
      const currentSaves = localStorage.getItem('d_saves');

      if (!currentSaves) {
        const newSaves = new Array(100);
        localStorage.setItem('d_saves', JSON.stringify(newSaves));

        return newSaves;
      } else {
        return JSON.parse(currentSaves);
      }
    }
  }

  _generateSaves() {
    for (let i = 0; i < 100; ++i) {
      const tile = this._generateSaveTile(this._saves[i], i);
      this._dom.content.appendChild(tile);
    }
  }

  _generateSaveTile(data, index) {
    const tile = document.createElement('div');
    tile.classList.add('d_save__tile');

    const thumb = document.createElement('img');
    thumb.classList.add('d_save__thumbnail');

    const title = document.createElement('div');
    title.classList.add('d_save__title');

    const date = document.createElement('div');
    date.classList.add('d_save__date');

    const number = document.createElement('div');
    number.classList.add('d_save__number');
    number.textContent = '#' + ('00' + (index + 1)).slice(-3);

    const buttonWrap = document.createElement('div');
    buttonWrap.classList.add('d_save__button-wrap');

    const saveButton = document.createElement('div');
    saveButton.classList.add('d_button');
    saveButton.textContent = 'Save';

    if (this._isSave) {
      saveButton.addEventListener('click', () => {
        this._selectedSaveSlot = index;
        D.EngineStore.setData('takeScreenshot', true);
      });
    } else {
      saveButton.classList.add('d_button--disabled');
    }

    const loadButton = document.createElement('div');
    loadButton.classList.add('d_button');
    loadButton.textContent = 'Load';

    const deleteButton = document.createElement('div');
    deleteButton.classList.add('d_save__delete');
    deleteButton.classList.add('d_button');
    deleteButton.classList.add('d_button--small');
    deleteButton.classList.add('d_button--warning');
    deleteButton.textContent = 'Delete';

    if (data) {
      thumb.src = data.thumbnail;
      title.textContent = data.title;
      date.textContent = new Date(data.date).toLocaleDateString() + ' ' + new Date(data.date).toLocaleTimeString();

      loadButton.addEventListener('click', () => this.load(data));
    } else {
      thumb.src = './static/submenu_2.jpg';
      title.textContent = '-';
      date.textContent = '-';

      loadButton.classList.add('d_button--disabled');
      deleteButton.classList.add('d_button--disabled');
    }

    tile.appendChild(thumb);
    tile.appendChild(title);
    tile.appendChild(date);
    tile.appendChild(number);
    tile.appendChild(buttonWrap);
    buttonWrap.appendChild(saveButton);
    buttonWrap.appendChild(loadButton);
    tile.appendChild(deleteButton);

    return tile;
  }
}

export default new Save();
