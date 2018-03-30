import StringHelper from './helpers/String';
import ResourceLoader from './modules/ResourceLoader';
import HTMLRenderer from './modules/HTMLRenderer';
import HTMLState from './modules/HTMLState';
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
import { Textbox, Narrator } from './modules/Textbox';
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
import { version } from '../../version.json';

class Main {
  constructor() {
    window.D = {
      App: null,
      Renderer: null,
      Stage: null,
      ResourceLoader: ResourceLoader,

      HTMLState: HTMLState,
      HTMLRenderer: HTMLRenderer,

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
      Textbox: Textbox,
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
    this._dom.mainContainer = document.querySelector('.js_main_container');
    this._dom.gameWarpper = document.querySelector('.js_game_wrapper');
    this._dom.effectWrapper = document.querySelector('.js_effect_wrapper');

    D.HTMLRenderer.state = D.HTMLState;
    D.HTMLRenderer.container = this._dom.mainContainer;

    D.HTMLState.set('version', version);

    this._windowWidth = 1920;
    this._windowHeight = 1080;
    D.HTMLState.set('window.width', this._windowWidth);
    D.HTMLState.set('window.height', this._windowHeight);

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

    document.body.insertBefore(D.App.view, document.body.firstElementChild);
    window.addEventListener('resize', this._resize.bind(this));

    D.Stage = D.App.stage;
    D.Stage.filterArea = new PIXI.Rectangle(0, 0, this._windowWidth, this._windowHeight);

    this._resize();
    this._load();
  }

  _resize() {
    this._windowWidth = window.innerWidth;
    this._windowHeight = window.innerHeight;

    const canvas = D.App.view;
    const scaleX = this._windowWidth / 1920;
    const scaleY = this._windowHeight / 1080;
    const scale = scaleX > scaleY ? this._windowHeight / 1080 : this._windowWidth / 1920;
    D.HTMLState.set('scale', scale);

    const wrapperWidth = scaleX > scaleY ? parseInt(1920 * scaleY) : this._windowWidth;
    const wrapperHeight = scaleX > scaleY ? this._windowHeight : parseInt(1080 * scaleX);
    const wrapperLeft = (this._windowWidth - wrapperWidth) / 2;
    D.HTMLState.set('wrapper.width', wrapperWidth);
    D.HTMLState.set('wrapper.height', wrapperHeight);
    D.HTMLState.set('wrapper.left', wrapperLeft);

    canvas.style.transform = `scale(${scale})`;
    canvas.style.marginLeft = `${wrapperLeft}px`;
    canvas.style.display = 'block';

    D.HTMLRenderer.render();
  }

  _load() {
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

    D.Background.init();
    D.GameMenu.init();
    D.History.init();
    D.Save.init();
    D.Settings.init();
    D.Textbox.init();
    D.Narrator.init();
    D.Character.init();
    D.Picture.init();
    D.Scene.init();
    D.Alert.init();
    D.Choose.init();
    D.Input.init();
    D.MainMenu.init();
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
