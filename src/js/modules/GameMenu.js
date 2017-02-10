class GameMenu {
  constructor() {
    this._dom = {};
    this._dom.gameMenu = document.querySelector('.js_game_menu');
    this._dom.history = document.querySelector('.js_game_menu_history');
    this._dom.save = document.querySelector('.js_game_menu_save');

    this._dom.history.addEventListener('mousedown', (event) => {
      if (event.which !== 1) {
        return;
      }

      D.History.show();
    });

    this._dom.history.addEventListener('mousedown', this._history.bind(this));
    this._dom.save.addEventListener('mousedown', this._save.bind(this));
  }

  show() {
    this._dom.gameMenu.classList.add('d_game-menu--visible');
  }

  _history(event) {
    if (event.which !== 1) {
      return;
    }

    D.History.show();
  }

  _save(event) {
    if (event.which !== 1) {
      return;
    }

    D.Save.show(true);
  }
}

export default new GameMenu();
