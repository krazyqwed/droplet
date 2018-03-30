class MainMenu {
  constructor() {
    this._dom = {};
    this._dom.menuWrap = document.querySelector('.js_main_menu_wrap');
    this._dom.menu = document.querySelector('.js_main_menu');
  }

  init() {
    D.HTMLState.set('mainMenu.event.new', this._newGameCallback.bind(this));
    D.HTMLState.set('mainMenu.event.load', this._loadGameCallback.bind(this));
    D.HTMLState.set('mainMenu.event.settings', this._settingsCallback.bind(this));
    D.HTMLState.set('mainMenu.event.exit', this._exitCallback.bind(this));
    D.HTMLState.set('mainMenu.event.mouseenter', this._setActive.bind(this));
    D.HTMLState.set('mainMenu.event.mouseleave', this._unsetActive.bind(this));
  }

  show() {
    D.HTMLState.set('mainMenu.visible', true);
    D.SceneStore.setData('gameInProgress', false);
    D.Background.handleAction({ event: 'load', image: 'main_menu' });
  }

  _newGameCallback() {
    D.Story.start();
  }

  _loadGameCallback() {
    D.HTMLState.set('mainMenu.visible', false);
    D.Save.show();
  }

  _settingsCallback() {
    D.HTMLState.set('mainMenu.visible', false);
    D.Settings.show();
  }

  _exitCallback() {
    console.log('exit');
  }

  _setActive(index) {
    D.HTMLState.set('mainMenu.activeItem', index);
  }

  _unsetActive(index) {
    D.HTMLState.set('mainMenu.activeItem', false);
  }
}

export default new MainMenu();
