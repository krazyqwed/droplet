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
    document.body.insertBefore(D.Renderer.view, document.querySelector('.js_main_wrapper'));

    D.Stage = new PIXI.Container();

    this._resize();
    this._load();
  }

  _resize() {
    const canvas = document.querySelector('canvas');
    const wrapper = document.querySelector('.js_main_wrapper');
    const wWidth = wrapper.offsetWidth;
    const wHeight = wrapper.offsetHeight;
    let newWidth, newHeight;
    let scale = false, scaleX = wWidth / 1920, scaleY = wHeight / 1080;

    if (scaleX > scaleY){
      scale = scaleY;

      wrapper.style.width = parseInt(1920 * scale) + 'px';
      wrapper.style.height = wHeight + 'px';
    }else if (scaleY >= scaleX){
      scale = scaleX;

      wrapper.style.width = wWidth + 'px';
      wrapper.style.height = parseInt(1080 * scale) + 'px';
    }

    canvas.style.transform = 'scale(' + scale + ')';

    wrapper.querySelector('.js_gui_element').style.transform = 'scale(' + scale + ')';
    wrapper.style.position = 'static';

    const margin = wrapper.offsetLeft + 'px';

    wrapper.querySelector('.js_gui_element').style.marginLeft = margin;
    canvas.style.marginLeft = margin;
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
