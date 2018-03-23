import hyperHTML from 'hyperhtml';

import StringHelper from './helpers/String';
import ResourceLoader from './modules/ResourceLoader';
import MainMenu from './modules/MainMenu';
import GameMenu from './modules/GameMenu';
import Variable from './modules/Variable';
import Filter from './modules/Filter';
import Background from './modules/Background';
import ActionQueue from './modules/ActionQueue';
import Story from './modules/Story';
import Scene from './modules/Scene';
import Goto from './modules/Goto';
import Wait from './modules/Wait';
import { Dialog, Narrator } from './modules/Dialog';
import Character from './modules/Character';
import Picture from './modules/Picture';
import Choose from './modules/Choose';
import Input from './modules/Input';
import Sound from './modules/Sound';
import History from './modules/History';
import Save from './modules/Save';
import Settings from './modules/Settings';
import Alert from './modules/Alert';
import EngineStore from './stores/EngineStore';
import SceneStore from './stores/SceneStore';
import Slider from './modules/Slider';

class Main {
  constructor() {
    window.D = {
      App: null,
      Renderer: null,
      Stage: null,
      ResourceLoader: ResourceLoader,

      EngineStore: new EngineStore(),
      SceneStore: new SceneStore(),

      MainMenu: MainMenu,
      GameMenu: GameMenu,

      Variable: Variable,
      Filter: Filter,
      Background: Background,
      ActionQueue: ActionQueue,
      Story: Story,
      Scene: Scene,
      Goto: Goto,
      Wait: Wait,
      Dialog: Dialog,
      Narrator: Narrator,
      Character: Character,
      Picture: Picture,
      Choose: Choose,
      Input: Input,
      Sound: Sound,
      History: History,

      Save: Save,
      Settings: Settings,
      Alert: Alert,

      FPSMeter: new FPSMeter()
    };

    this._stageChildrenCount = 0;

    this._dom = {};
    this._dom.dimensionHelper = document.querySelector('.js_dimension_helper');
    this._dom.scaleHelper = document.querySelector('.js_scale_helper');
    this._dom.mainWarpper = document.querySelector('.js_main_wrapper');
    this._dom.effectWrapper = document.querySelector('.js_effect_wrapper');

    this._windowWidth = 1920;
    this._windowHeight = 1080;

    this._init();
  }

  _init() {
    D.App = new PIXI.Application(this._windowWidth, this._windowHeight, {
      antialias: false,
      transparent: true,
      resolution: 1,
      preserveDrawingBuffer: true
    });
    D.App.view.style.display = 'none';
    D.Renderer = D.App.renderer;

    document.body.insertBefore(D.App.view, this._dom.dimensionHelper.nextSibling);
    window.addEventListener('resize', this._resize.bind(this));

    D.Stage = D.App.stage;
    D.Stage.filterArea = new PIXI.Rectangle(0, 0, this._windowWidth, this._windowHeight);

    this._resize();
    this._load();
  }

  _resize() {
    this._windowWidth = this._dom.dimensionHelper.offsetWidth;
    this._windowHeight = this._dom.dimensionHelper.offsetHeight;

    const canvas = D.App.view;
    const scaleX = this._windowWidth / 1920;
    const scaleY = this._windowHeight / 1080;
    const scale = scaleX > scaleY ? this._windowHeight / 1080 : this._windowWidth / 1920;
    const wrapperWidth = scaleX > scaleY ? parseInt(1920 * scaleY) : this._windowWidth;
    const wrapperHeight = scaleX > scaleY ? this._windowHeight : parseInt(1080 * scaleX);

    this._dom.mainWarpper.style.width = wrapperWidth + 'px';
    this._dom.mainWarpper.style.height = wrapperHeight + 'px';
    this._dom.effectWrapper.style.width = wrapperWidth + 'px';
    this._dom.effectWrapper.style.height = wrapperHeight + 'px';
    this._dom.scaleHelper.style.width = wrapperWidth + 'px';
    this._dom.scaleHelper.style.height = wrapperHeight + 'px';

    const guiElements = document.querySelectorAll('.js_gui_element');

    [].forEach.call(guiElements, (elem) => {
      elem.style.transform = 'scale(' + scale + ')';
    });

    const gameMenuHistory = this._dom.mainWarpper.querySelector('.js_history .js_gui_element');
    gameMenuHistory.style.transform = 'scale(' + scale + ') translateX(-50%) translateY(-50%)';

    const gameMenuSave = this._dom.mainWarpper.querySelector('.js_save .js_gui_element');
    gameMenuSave.style.transform = 'scale(' + scale + ') translateX(-50%) translateY(-50%)';

    const gameMenuSettings = this._dom.mainWarpper.querySelector('.js_settings .js_gui_element');
    gameMenuSettings.style.transform = 'scale(' + scale + ')';

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
      'picture_1.png',
      'bgm_1.mp3',
      'bgm_2.mp3',
      'whosh.mp3',
      'birds.mp3'
    ];

    D.ResourceLoader.on('after', (resource, next) => {
      const filename = resource.data.meta.image;
      assetsToLoader.push(filename + '_avatar.png');

      Object.keys(resource.data.frames).forEach((frame) => {
        const image = new Image();
        image.onload = () => {
          const baseTexture = new PIXI.BaseTexture(image);
          const texture = new PIXI.Texture(baseTexture);
          const f = resource.data.frames[frame].frame;
          texture.frame = new PIXI.Rectangle(f.x, f.y, f.w, f.h);
          PIXI.Texture.addToCache(texture, frame);
        }
        image.src = 'static/' + filename + '.png';
      });

      next();
    });

    D.ResourceLoader.on('complete', (loader) => {
      D.ResourceLoader.reset();

      D.ResourceLoader.on('after', (resource, next) => {
        if (resource.type === 3) {
          const image = new Image();
          image.src = resource.url;
          const baseTexture = new PIXI.BaseTexture(image);
          const texture = new PIXI.Texture(baseTexture);
          const filename = StringHelper.extractFilename(resource.url);

          PIXI.Texture.addToCache(texture, filename);

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

      D.ResourceLoader.on('progress', this._loadProgress.bind(this));
      D.ResourceLoader.on('complete', this._loadFinished.bind(this));
      D.ResourceLoader.load(assetsToLoader);
    });

    D.ResourceLoader.load(assetDefinersToLoader);
  }

  _loadProgress(progress, resource) {
    //console.log(progress, resource);
  }

  _loadFinished() {
    this._resize();
    this._dom.mainWarpper.style.removeProperty('display');

    D.Background.init();
    D.Save.init();
    D.Dialog.init();
    D.Narrator.init();
    D.Character.init();
    D.Picture.init();
    D.Scene.init();
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
    D.Filter.tick();

    this._updateLayersOrder();

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
