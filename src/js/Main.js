import StringHelper from './helpers/String';
import Loader from './modules/Loader';
import MainMenu from './modules/MainMenu';
import GameMenu from './modules/GameMenu';
import Variable from './modules/Variable';
import Background from './modules/Background';
import Story from './modules/Story';
import Scene from './modules/Scene';
import { Text, Narrator } from './modules/Text';
import Character from './modules/Character';
import Choose from './modules/Choose';
import Input from './modules/Input';
import Sound from './modules/Sound';
import History from './modules/History';
import Save from './modules/Save';
import Alert from './modules/Alert';
import EngineStore from './stores/EngineStore';
import SceneStore from './stores/SceneStore';

class Main {
  constructor() {
    window.D = {
      Renderer: null,
      Stage: null,
      Loader: Loader,

      EngineStore: new EngineStore(),
      SceneStore: new SceneStore(),

      MainMenu: MainMenu,
      GameMenu: GameMenu,

      Variable: Variable,
      Background: Background,
      Story: Story,
      Scene: Scene,
      Text: Text,
      Narrator: Narrator,
      Character: Character,
      Choose: Choose,
      Input: Input,
      Sound: Sound,
      History: History,

      Save: Save,
      Alert: Alert,

      FPSMeter: new FPSMeter()
    };

    this._stageChildrenCount = 0;

    this._dom = {};
    this._dom.dimensionHelper = document.querySelector('.js_dimension_helper');
    this._dom.scaleHelper = document.querySelector('.js_scale_helper');
    this._dom.mainWarpper = document.querySelector('.js_main_wrapper');

    this._windowWidth = 1920;
    this._windowHeight = 1080;

    this._init();
  }

  _init() {
    D.Renderer = PIXI.autoDetectRenderer(this._windowWidth, this._windowHeight, {
      antialias: false,
      transparent: false,
      resolution: 1
    });
    D.Renderer.view.style.display = 'none';

    document.body.insertBefore(D.Renderer.view, this._dom.mainWarpper);
    window.addEventListener('resize', this._resize.bind(this));

    D.Stage = new PIXI.Container();

    this._resize();
    this._load();
  }

  _resize() {
    this._windowWidth = this._dom.dimensionHelper.offsetWidth;
    this._windowHeight = this._dom.dimensionHelper.offsetHeight;

    const canvas = D.Renderer.view;
    let scale = 1;
    let scaleX = this._windowWidth / 1920;
    let scaleY = this._windowHeight / 1080;

    if (scaleX > scaleY) {
      scale = this._windowHeight / 1080;

      this._dom.mainWarpper.style.width = parseInt(1920 * scaleY) + 'px';
      this._dom.mainWarpper.style.height = this._windowHeight + 'px';
      this._dom.scaleHelper.style.width = parseInt(1920 * scaleY) + 'px';
      this._dom.scaleHelper.style.height = this._windowHeight + 'px';
    } else {
      scale = this._windowWidth / 1920;

      this._dom.mainWarpper.style.width = this._windowWidth + 'px';
      this._dom.mainWarpper.style.height = parseInt(1080 * scaleX) + 'px';
      this._dom.scaleHelper.style.width = this._windowWidth + 'px';
      this._dom.scaleHelper.style.height = parseInt(1080 * scaleX) + 'px';
    }

    const guiElements = this._dom.mainWarpper.querySelectorAll('.js_gui_element');

    [].forEach.call(guiElements, (elem) => {
      elem.style.transform = 'scale(' + scale + ')';
    });
    this._dom.mainWarpper.style.position = 'relative';

    const gameMenuHistory = this._dom.mainWarpper.querySelector('.js_history .js_gui_element');
    gameMenuHistory.style.transform = 'scale(' + scale + ') translateX(-50%) translateY(-50%)';

    const gameMenuSave = this._dom.mainWarpper.querySelector('.js_save .js_gui_element');
    gameMenuSave.style.transform = 'scale(' + scale + ') translateX(-50%) translateY(-50%)';

    const gameMenuAlert = this._dom.mainWarpper.querySelector('.js_alert .js_gui_element');
    gameMenuAlert.style.transform = 'scale(' + scale + ') translateX(-50%) translateY(-50%)';

    canvas.style.transform = 'scale(' + scale + ')';
    canvas.style.marginLeft = this._dom.scaleHelper.offsetLeft + 'px';
    canvas.style.display = 'block';
  }

  _load() {
    this._dom.mainWarpper.style.display = 'none';

    const assetDefinersToLoader = [
      'char_1.json',
      'char_2.json'
    ];

    const assetsToLoader = [
      'school_1.jpg',
      'school_2.jpg',
      'school_3.jpg',
      'main_menu.jpg',
      'submenu_1.jpg',
      'submenu_2.jpg',
      'player_avatar.png',
      'bgm_1.mp3',
      'bgm_2.mp3',
      'whosh.mp3',
      'birds.mp3'
    ];

    D.Loader.on('after', (resource, next) => {
      const filename = resource.data.meta.image;
      assetsToLoader.push(filename + '_avatar.png');

      Object.keys(resource.data.frames).forEach((frame) => {
        const image = new Image();
        image.onload = () => {
          const baseTexture = new PIXI.BaseTexture(image);
          const texture = new PIXI.Texture(baseTexture);
          const f = resource.data.frames[frame].frame;
          texture.setFrame(new PIXI.Rectangle(f.x, f.y, f.w, f.h));
          PIXI.Texture.addTextureToCache(texture, frame);
        }
        image.src = 'static/' + filename + '.png';
      });

      next();
    });
    D.Loader.on('complete', (loader) => {
      console.log();
      D.Loader.reset();
      D.Loader.on('after', (resource, next) => {
        if (resource.type === 3) {
          const image = new Image();
          image.src = resource.url;
          const baseTexture = new PIXI.BaseTexture(image);
          const texture = new PIXI.Texture(baseTexture);
          const filename = StringHelper.extractFilename(resource.url);

          PIXI.Texture.addTextureToCache(texture, filename);

          next();
        } else if (resource.type === 4) {
          var request = new XMLHttpRequest();
          request.open("GET", resource.url, true);
          request.responseType = "arraybuffer";

          request.onload = () => {
            next();
          }

          request.send();
        }
      });
      D.Loader.on('progress', this._loadProgress.bind(this));
      D.Loader.on('complete', this._loadFinished.bind(this));
      D.Loader.load(assetsToLoader);
    });
    D.Loader.load(assetDefinersToLoader);
  }

  _loadProgress(progress, resource) {
    //console.log(progress, resource);
  }

  _loadFinished() {
    this._resize();
    this._dom.mainWarpper.style.removeProperty('display');

    D.Background.init();
    D.MainMenu.show();

    this._update();
  }

  _updateLayersOrder() {
    D.Stage.children.sort(function(a, b) {
      if (a.position.z < b.position.z) {
        return -1;
      }

      if (a.position.z > b.position.z) {
        return 1;
      }

      return 0;
    });
  }

  _update() {
    D.FPSMeter.tickStart();

    this._updateLayersOrder();

    requestAnimationFrame(() => {
      this._render();
      this._update();
    });
  }

  _render() {
    D.Renderer.render(D.Stage);

    if (D.EngineStore.getData('createSave')) {
      D.EngineStore.setData('createSave', false);
    }

    D.FPSMeter.tick();
  }
}

(function() {
  new Main();
})();
