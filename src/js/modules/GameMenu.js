class GameMenu {
  constructor() {
    this._dom = {};
    this._dom.gameMenu = document.querySelector('.js_game_menu');
    this._dom.history = document.querySelector('.js_game_menu_history');

    this._dom.history.addEventListener('mousedown', (event) => {
      if (event.which !== 1) {
        return;
      }

      D.History.show();
    });
  }

  show() {
    this._dom.gameMenu.classList.add('d_game-menu--visible');
  }

  _showHistory() {

  }
}

export default new GameMenu();
