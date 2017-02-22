import SystemHelper from '../helpers/System';
import CommonHelper from '../helpers/Common';

class Save {
  constructor() {
    this._isSave = true;
    this._selectedSaveSlot = 0;
    this._saves = this._getSaves();
    this._dom = {};
    this._dom.wrap = document.querySelector('.js_save');
    this._dom.content = document.querySelector('.js_save_content');
    this._dom.back = document.querySelector('.js_save_back');
    this._dom.back.addEventListener('mousedown', this._hide.bind(this));
    this._events = {};
    this._events.show = this._showEvent.bind(this);
  }

  init() {
    D.EngineStore.subscribe('createSave', this._save.bind(this));
  }

  show(isSave) {
    this._isSave = !isSave || isSave === false ? false : true;
    this._dom.wrap.style.removeProperty('display');

    this._generateSaves();

    requestAnimationFrame(() => {
      this._dom.wrap.classList.add('d_save-wrap--visible');

      window.addEventListener('keydown', this._events.show);
    });
  }

  _showEvent(event) {
    if (event.which === 27 && !D.EngineStore.getData('alertOpen')) {
      event.preventDefault();
      this._hide();
    }
  }

  _hide() {
    this._dom.wrap.classList.remove('d_save-wrap--visible');

    window.removeEventListener('keydown', this._events.show);

    CommonHelper.requestTimeout(() => {
      this._dom.wrap.style.display = 'none';
    }, 300);
  }

  _promptSave() {
    if (!this._saves[this._selectedSaveSlot]) {
      D.EngineStore.setData('createSave', true);
      return;
    }

    const saveSubscription = D.EngineStore.subscribe('alertAnswer', (data, prev, name) => {
      if (data === true) {
        D.EngineStore.setData('createSave', true);
      }

      D.Alert.hide();
      saveSubscription.unsubscribe();
      D.EngineStore.setData(name, null);
    });

    D.Alert.show({
      description: 'Are you sure you want to overwrite an existing save?',
      cancel: 'No, keep it...',
      confirm: 'Yes, I\'m sure!'
    });
  }

  _save() {
    let img = document.createElement('img');
    img.src = D.Renderer.view.toDataURL('image/jpeg', 1);

    var canvas = document.createElement("canvas");
    canvas.width = 1920 / 4;
    canvas.height = 1080 / 4;

    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    const saveData = {
      date: new Date().toString(),
      thumbnail: canvas.toDataURL('image/jpeg', 1),
      title: D.Scene.getState().scene.title,
      state: {
        scene: D.Scene.getState().scene.id,
        keyframe: D.Scene.getState().keyframe,
        characters: D.Character.getState(),
        variables: D.Variable.getState(),
        background: D.Background.getState(),
        sounds: D.Sound.getState()
      }
    };

    this._saves[this._selectedSaveSlot] = saveData;

    if (SystemHelper.isElectron()) {
      const app = require('electron').remote.app;
      const savesFolder = app.getPath('userData') + '\\saves';
      const fs = require('fs');

      fs.writeFileSync(savesFolder + '\\' + this._selectedSaveSlot + '.json', JSON.stringify(saveData));
    } else {
      localStorage.setItem('d_saves', JSON.stringify(this._saves));
    }

    this._hide();
  }

  _promptLoad(loadData) {
    if (!D.SceneStore.getData('gameInProgress')) {
      this._load(loadData);
      return;
    }

    const loadSubscription = D.EngineStore.subscribe('alertAnswer', (data, prev, name) => {
      if (data === true) {
        this._load(loadData);
      }

      D.Alert.hide();
      loadSubscription.unsubscribe();
      D.EngineStore.setData(name, null);
    });

    D.Alert.show({
      description: 'Are you sure you want to leave from the current session?',
      cancel: 'No, stay here...',
      confirm: 'Yes, I\'m sure!'
    });
  }

  _load(data) {
    D.SceneStore.setData('loadFromSave', true);
    D.Variable.setState(data.state.variables);
    D.Story.loadScene(data.state.scene, data.state.keyframe);
    D.Character.setState(data.state.characters);
    D.Background.setState(data.state.background);
    D.Sound.setState(data.state.sounds);

    CommonHelper.requestTimeout(() => {
      this._hide();
    }, 500);
  }


  _promptDelete() {
    const deleteSubscription = D.EngineStore.subscribe('alertAnswer', (data, prev, name) => {
      if (data === true) {
        this._delete();
      }

      D.Alert.hide();
      deleteSubscription.unsubscribe();
      D.EngineStore.setData(name, null);
    });

    D.Alert.show({
      description: 'Are you sure you want to delete this save?',
      cancel: 'No, keep it...',
      confirm: 'Yes, I\'m sure!'
    });
  }

  _delete() {
    this._saves[this._selectedSaveSlot] = null;

    if (SystemHelper.isElectron()) {
      const app = require('electron').remote.app;
      const savesFolder = app.getPath('userData') + '\\saves';
      const fs = require('fs');

      fs.unlinkSync(savesFolder + '\\' + this._selectedSaveSlot + '.json');
    } else {
      localStorage.setItem('d_saves', JSON.stringify(this._saves));
    }

    this._generateSaves();
  }

  _getSaves() {
    if (SystemHelper.isElectron()) {
      const app = require('electron').remote.app;
      const savesFolder = app.getPath('userData') + '\\saves';
      const fs = require('fs');
      const saves = new Array(100);

      if (!fs.existsSync(savesFolder)){
        fs.mkdirSync(savesFolder);
      }

      const files = fs.readdirSync(savesFolder);

      files.forEach(file => {
        let fileId = file.split('.');
        fileId.pop();
        fileId = fileId[0];

        saves[fileId] = JSON.parse(fs.readFileSync(savesFolder + '\\' + file).toString());
      });

      return saves;
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
    this._dom.content.innerHTML = '';

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
        this._promptSave();
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

      loadButton.addEventListener('click', () => this._promptLoad(data));
      deleteButton.addEventListener('click', () => {
        this._selectedSaveSlot = index;
        this._promptDelete();
      });
    } else {
      thumb.src = 'static/submenu_2.jpg';
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
