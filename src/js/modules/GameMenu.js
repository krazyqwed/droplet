class GameMenu {
  constructor() {
    this._events = {};
    this._events.showHistory = this._showHistory.bind(this);
    this._events.showSave = this._showSave.bind(this);
    this._events.showSettings = this._showSettings.bind(this);
  }

  init() {
    D.HTMLState.set('gui.gameMenu.event.showHistory', this._events.showHistory);
    D.HTMLState.set('gui.gameMenu.event.showSave', this._events.showSave);
    D.HTMLState.set('gui.gameMenu.event.showSettings', this._events.showSettings);
  }

  show() {
    D.HTMLState.set('gui.gameMenu.visible', true);
  }

  _showHistory(event) {
    D.History.show();
  }

  _showSave(event) {
    D.Save.show(true);
  }

  _showSettings(event) {
    D.Settings.show(true);
  }
}

export default new GameMenu();
