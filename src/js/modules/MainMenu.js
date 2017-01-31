import Timer from './Timer'; 

class SubMenu {
  constructor() {
    this._dom = {};
    this._dom.load = document.querySelector('.js_submenu_load');
    this._dom.settings = document.querySelector('.js_submenu_settings');
  }

  show(name) {
    this._dom[name];
  }
}

class MainMenu {
  constructor() {
    this._dom = {};
    this._dom.menuWrap = document.querySelector('.js_main_menu_wrap');
    this._dom.menu = document.querySelector('.js_main_menu');
    this._timer = new Timer();
    this._timer.addEvent('show', this._showEvent.bind(this), 1, true, 45);
    this._timer.addEvent('chose', this._blinkEvent.bind(this), 1, true, 24);

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
    console.log('new');
  }

  _loadGameCallback() {
    console.log('load');
  }

  _settingsCallback() {
    console.log('settings');
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
      itemElement.addEventListener('click', this._select.bind(this, itemElement, item.callback));

      this._dom.menu.appendChild(itemElement);
    });
  }

  _setActive(item) {
    if (this._selected) {
      return;
    }

    item.classList.add('d_main-menu__item--active');
  }

  _unsetActive(item) {
    if (this._selected) {
      return;
    }

    item.classList.remove('d_main-menu__item--active');
  }

  _select(item, callback) {
    if (this._selected) {
      return;
    }

    this._selected = true;

    this._timer.start('chose', {
      item: item,
      callback: callback
    });
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
    this._dom.choose.innerHTML = '';
    this._dom.menuWrap.classList.remove('d_gui-element--visible');
  }

  _showEvent(event) {
    if (event.over) {
      this._dom.menuWrap.classList.remove('d_gui-element--disable');
      this._timer.destroy('show');
    }
  }

  _blinkEvent(event) {
    const item = event.params.item;
    const callback = event.params.callback;

    if (event.runCount === 1) {
      item.classList.add('d_main-menu__item--blink');
    }

    if (event.over) {
      item.classList.remove('d_main-menu__item--blink');

      callback();
      this._timer.destroy('chose');
    }
  }
}

export default new MainMenu();
