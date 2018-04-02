import SystemHelper from '../helpers/System';
import CommonHelper from '../helpers/Common';

class Save {
  constructor() {
    this._isSave = true;
    this._saves = this._getSaves();

    this._events = {};
    this._events.hide = this._hideEvent.bind(this);
  }

  init() {
    D.HTMLState.set('save.event.back', this._hide.bind(this));
    D.HTMLState.set('save.event.promptSave', this._promptSave.bind(this));
    D.HTMLState.set('save.event.promptLoad', this._promptLoad.bind(this));
    D.HTMLState.set('save.event.promptDelete', this._promptDelete.bind(this));
    D.EngineStore.subscribe('createSave', this._save.bind(this));
  }

  show(isSave) {
    D.HTMLState.set('save.visible', true);
    D.HTMLState.set('save.files', this._generateSaves(isSave));
    D.HTMLState.set('save.isSave', isSave);
    D.SceneStore.setData('menuOpen', true);
  }

  _hideEvent(event) {
    if (event.which === 27 && !D.EngineStore.getData('alertOpen')) {
      event.preventDefault();
      this._hide();
    }
  }

  _hide() {
    D.HTMLState.set('save.visible', false);
    D.SceneStore.setData('menuOpen', false);

    if (!D.SceneStore.getData('gameInProgress')) {
      D.HTMLState.set('mainMenu.visible', true);
    }
  }

  _promptSave(file) {
    if (!this._saves[file.index]) {
      D.EngineStore.setData('createSave', file);
      return;
    }

    const saveSubscription = D.EngineStore.subscribe('alertAnswer', (data) => {
      if (data === true) {
        D.EngineStore.setData('createSave', file);
      }

      D.Alert.hide();
      saveSubscription.unsubscribe();
      D.EngineStore.setData('alertAnswer', false);
    });

    D.Alert.show({
      description: 'Are you sure you want to overwrite an existing save?',
      cancel: 'No, keep it...',
      confirm: 'Yes, I\'m sure!'
    });
  }

  _save(file) {
    if (!D.EngineStore.getData('createSave')) {
      return;
    }

    let img = document.createElement('img');

    D.Renderer.render(D.Stage);
    img.src = D.Renderer.view.toDataURL('image/jpeg', 1);

    requestAnimationFrame(() => {
      var canvas = document.createElement('canvas');
      canvas.width = D.Renderer.width / 8;
      canvas.height = D.Renderer.height / 8;

      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

      const saveData = {
        date: new Date().getTime(),
        thumbnail: canvas.toDataURL('image/jpeg', 1),
        title: D.Scene.getState().scene.title,
        state: {
          scene: D.Scene.getState().scene.id,
          keyframe: D.Scene.getState().keyframe,
          subframe: D.Scene.getState().subframe,
          characters: D.Character.getState(),
          pictures: D.Picture.getState(),
          variables: D.Variable.getState(),
          background: D.Background.getState(),
          sounds: D.Sound.getState()
        }
      };

      this._saves[file.index] = saveData;

      if (SystemHelper.isElectron()) {
        const app = require('electron').remote.app;
        const savesFolder = app.getPath('userData') + '\\saves';
        const fs = require('fs');

        fs.writeFileSync(savesFolder + '\\' + file.index + '.json', JSON.stringify(saveData));
      } else {
        localStorage.setItem('d_saves', JSON.stringify(this._saves));
      }

      this._hide();
    });

    D.EngineStore.setData('createSave', false);
  }

  _promptLoad(file) {
    if (!D.SceneStore.getData('gameInProgress')) {
      this._load(file.saveData);
      return;
    }

    const loadSubscription = D.EngineStore.subscribe('alertAnswer', (data) => {
      if (data === true) {
        this._load(file.saveData);
      }

      D.Alert.hide();
      loadSubscription.unsubscribe();
      D.EngineStore.setData('alertAnswer', false);
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
    D.Story.loadScene(data.state.scene, data.state.keyframe, data.state.subframe);
    D.Character.setState(data.state.characters);
    D.Picture.setState(data.state.pictures);
    D.Background.setState(data.state.background);
    D.Sound.setState(data.state.sounds);
    D.History.erase();

    CommonHelper.requestTimeout(() => {
      this._hide();
    }, 500);
  }

  _promptDelete(file) {
    const deleteSubscription = D.EngineStore.subscribe('alertAnswer', (data) => {
      if (data === true) {
        this._delete(file);
      }

      D.Alert.hide();
      deleteSubscription.unsubscribe();
      D.EngineStore.setData('alertAnswer', false);
    });

    D.Alert.show({
      description: 'Are you sure you want to delete this save?',
      cancel: 'No, keep it...',
      confirm: 'Yes, I\'m sure!'
    });
  }

  _delete(file) {
    this._saves[file.index] = null;

    if (SystemHelper.isElectron()) {
      const app = require('electron').remote.app;
      const savesFolder = app.getPath('userData') + '\\saves';
      const fs = require('fs');

      fs.unlinkSync(savesFolder + '\\' + file.index + '.json');
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
    let tiles = [];

    for (let i = 0; i < 100; ++i) {
      const tile = this._generateSaveTile(this._saves[i], i);
      tiles.push(tile);
    }

    return tiles;
  }

  _generateSaveTile(data, index) {
    const options = {
      saveData: false,
      index: index,
      date: '---'
    };

    if (data) {
      options.saveData = data;
      options.date = new Date(data.date).toLocaleDateString() + ' ' + new Date(data.date).toLocaleTimeString();
    }

    return options;
  }
}

export default new Save();
