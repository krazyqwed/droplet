import Timer from './Timer'; 
import CommonHelper from '../helpers/Common';

class SubMenu {
  constructor() {
    this._dom = {};
    this._dom.submenu = {};
    this._dom.submenu.load = document.querySelector('.js_submenu_load');
    this._dom.submenu.settings = document.querySelector('.js_submenu_settings');
  }

  show(name) {
    [].forEach.call(Object.keys(this._dom.submenu), (submenu) => {
      if (name !== submenu) {
        this._hide(submenu);
      }
    });

    this._dom.submenu[name].classList.add('d_gui-element--visible');
    this._dom.submenu[name].classList.remove('d_gui-element--disable');

    if (name === 'load') {
      this._menuLoad();
    }
  }

  _hide(name) {
    this._dom.submenu[name].classList.remove('d_gui-element--visible');
    this._dom.submenu[name].classList.add('d_gui-element--disable');
  }

  _menuLoad() {
    const saves = D.Save.getSaves();
  }
}

class MainMenu {
  constructor() {
    this._subMenu = new SubMenu();
    this._dom = {};
    this._dom.menuWrap = document.querySelector('.js_main_menu_wrap');
    this._dom.menu = document.querySelector('.js_main_menu');
    this._timer = new Timer();
    this._timer.addEvent('show', this._showEvent.bind(this), 1, true, 45);

    this._menuItems = [
      {
        text: 'New Game',
        callback: this._newGameCallback.bind(this)
      },
      {
        text: 'Load Game',
        callback: this._loadGameCallback.bind(this)
      },
      {
        text: 'Settings',
        callback: this._settingsCallback.bind(this)
      },
      {
        text: 'Exit',
        callback: this._exitCallback.bind(this)
      }
    ];
  }

  show() {
    D.Background.handleAction({
      event: 'load',
      background: 'main_menu'
    });

    this._buildItems();
    this._showMenu();
  }

  _newGameCallback() {
    this._hideMenu();

    D.Text.init();
    D.Narrator.init();
    D.Character.init();
    D.Scene.init();

    D.Story.start();
  }

  _loadGameCallback() {
    this._subMenu.show('load');
  }

  _settingsCallback() {
    this._subMenu.show('settings');
  }

  _exitCallback() {
    console.log('exit');
  }

  _buildItems() {
    this._dom.menu.innerHTML = '';

    this._menuItems.forEach((item) => {
      let itemElement = document.createElement('div');
      itemElement.className = 'd_main-menu__item';
      itemElement.innerHTML = item.text;
      itemElement.addEventListener('mouseenter', this._setActive.bind(this, itemElement));
      itemElement.addEventListener('mouseleave', this._unsetActive.bind(this, itemElement));
      itemElement.addEventListener('click', this._select.bind(this, item.callback));

      this._dom.menu.appendChild(itemElement);
    });
  }

  _setActive(item) {
    item.classList.add('d_main-menu__item--active');
  }

  _unsetActive(item) {
    item.classList.remove('d_main-menu__item--active');
  }

  _select(callback) {
    callback();
  }

  _showMenu() {
    this._dom.menuWrap.classList.add('d_gui-element--disable');

    requestAnimationFrame(() => {
      this._dom.menuWrap.classList.remove('d_gui-element--no-fade');
      this._dom.menuWrap.classList.add('d_gui-element--visible');
    });

    this._timer.start('show');
  }

  _hideMenu() {
    this._dom.menuWrap.classList.remove('d_gui-element--visible');
  }

  _showEvent(event) {
    if (event.over) {
      this._dom.menuWrap.classList.remove('d_gui-element--disable');
      this._timer.destroy('show');
    }
  }
}

export default new MainMenu();
