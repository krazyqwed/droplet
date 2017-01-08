import Variable from './modules/Variable';
import Scene from './modules/Scene';
import Text from './modules/Text';
import Character from './modules/Character';
import PixiStore from './stores/PixiStore';
import SceneStore from './stores/SceneStore';
import TextStore from './stores/TextStore';
import CharacterStore from './stores/CharacterStore';
import StringHelper from './helpers/String';

class Main {
  constructor() {
    window.D = {
      Renderer: null,
      Stage: null,

      PixiStore: new PixiStore(),
      SceneStore: new SceneStore(),
      TextStore: new TextStore(),
      CharacterStore: new CharacterStore(),

      Variable: Variable,
      Scene: Scene,
      Text: Text,
      Character: Character,

      StringHelper: StringHelper,

      FPSMeter: new FPSMeter()
    };

    this._init();
  }

  _init() {
    D.Renderer = PIXI.autoDetectRenderer(1920, 1080, {
      antialias: false,
      transparent: false,
      resolution: 1
    });
    D.Stage = new PIXI.Container();

    this._load();
  }

  _load() {
    var assetsToLoader = [
      'static/school_1.jpg',
      'static/school_2.jpg',
      'static/school_3.jpg',
      'static/char_1.json',
      'static/char_2.json'
    ];

    let loader = new PIXI.loaders.Loader();
    loader.add(assetsToLoader);
    loader.on('progress', this._loadProgress.bind(this));
    loader.load(this._loadFinished.bind(this));
  }

  _loadProgress(event, resource) {
    
  }

  _loadFinished() {
    document.body.appendChild(D.Renderer.view);

    D.Scene.init();
    D.Text.init();
    D.Character.init();

    this._update();
  }

  _update() {
    D.FPSMeter.tickStart();

    requestAnimationFrame(() => {
      this._render();
      this._update();
    });
  }

  _render() {
    D.Renderer.render(D.Stage);
    D.FPSMeter.tick();
  }
}

(function() {
  new Main();
})();
