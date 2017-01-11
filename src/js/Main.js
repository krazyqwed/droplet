import Variable from './modules/Variable';
import Story from './modules/Story';
import Scene from './modules/Scene';
import Text from './modules/Text';
import Character from './modules/Character';
import Choose from './modules/Choose';
import PixiStore from './stores/PixiStore';
import SceneStore from './stores/SceneStore';
import TextStore from './stores/TextStore';
import CharacterStore from './stores/CharacterStore';
import InteractionStore from './stores/InteractionStore';

class Main {
  constructor() {
    window.D = {
      Renderer: null,
      Stage: null,

      PixiStore: new PixiStore(),
      SceneStore: new SceneStore(),
      TextStore: new TextStore(),
      CharacterStore: new CharacterStore(),
      InteractionStore: new InteractionStore(),

      Variable: Variable,
      Story: Story,
      Scene: Scene,
      Text: Text,
      Character: Character,
      Choose: Choose,

      FPSMeter: new FPSMeter()
    };

    this._stageChildrenCount = 0;

    this._init();
  }

  _init() {
    D.Renderer = PIXI.autoDetectRenderer(1920, 1080, {
      antialias: false,
      transparent: false,
      resolution: 1
    });
    D.Renderer.view.style.display = 'none';
    document.body.insertBefore(D.Renderer.view, document.querySelector('.js_main_wrapper'));

    D.Stage = new PIXI.Container();

    this._resize();
    this._load();
  }

  _resize() {
    const canvas = D.Renderer.view;
    const wrapper = document.querySelector('.js_main_wrapper');
    const wWidth = wrapper.offsetWidth;
    const wHeight = wrapper.offsetHeight;
    let scale = 1;
    let scaleX = wWidth / 1920;
    let scaleY = wHeight / 1080;

    if (scaleX > scaleY) {
      scale = wHeight / 1080;

      wrapper.style.width = parseInt(1920 * scaleY) + 'px';
      wrapper.style.height = wHeight + 'px';
    } else {
      scale = wWidth / 1920;

      wrapper.style.width = wWidth + 'px';
      wrapper.style.height = parseInt(1080 * scaleX) + 'px';
    }

    const guiElements = wrapper.querySelectorAll('.js_gui_element');

    [].forEach.call(guiElements, (elem) => {
      elem.style.transform = 'scale(' + scale + ')';
    });
    wrapper.style.position = 'relative';

    canvas.style.transform = 'scale(' + scale + ')';
    canvas.style.marginLeft = wrapper.offsetLeft + 'px';
    canvas.style.display = 'block';
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
    D.Text.init();
    D.Character.init();
    D.Scene.init();

    D.Story.start();

    this._update();
  }

  _updateLayersOrder() {
    D.Stage.children.sort(function(a, b) {
      a.position.z = a.position.z || 0;
      b.position.z = b.position.z || 0;

      return a.position.z - b.position.z;
    });
  }

  _update() {
    D.FPSMeter.tickStart();

    if (this._stageChildrenCount !== D.Stage.children.length) {
      this._updateLayersOrder();
      this._stageChildrenCount = D.Stage.children.length;
    }

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
