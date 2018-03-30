import Timer from './Timer'; 

class Input {
  constructor() {
    this._options = false;

    this._events = {};
    this._events.confirmInput = this._confirmInput.bind(this);

    this._timer = new Timer();
    this._timer.addEvent('show', {
      callback: this._showEvent.bind(this),
      runLimit: 45
    });
    this._timer.addEvent('input', {
      callback: this._inputEvent.bind(this),
      runLimit: 24
    });
  }

  init() {
    D.HTMLState.set('gui.input.event.confirmInput', this._events.confirmInput);
  }

  handleAction(options) {
    this._options = options;
    D.SceneStore.setData('interactionRunning', true);

    this._showInput();
  }

  _confirmInput(input) {
    D.HTMLState.set('gui.input.enabled', false);
    D.Variable.set(this._options.store, input.value, 'string');

    this._timer.start('input');
  }

  _showInput() {
    D.HTMLState.set('gui.input.enabled', false);
    D.HTMLState.set('gui.input.visible', true);
    D.HTMLState.set('gui.input.value', '');

    const currentValue = D.Variable.get(this._options.store);

    if (currentValue) {
      D.HTMLState.set('gui.input.value', currentValue);
    }

    this._timer.start('show');
  }

  _hideInput() {
    D.HTMLState.set('gui.input.visible', false);
  }

  _showEvent(event) {
    if (event.over) {
      D.HTMLState.set('gui.input.enabled', true);
      this._timer.destroy('show');
    }
  }

  _inputEvent(event) {
    D.HTMLState.set('gui.input.confirmed', true);

    if (event.over) {
      D.HTMLState.set('gui.input.confirmed', false);
      D.SceneStore.setData('interactionRunning', false);
      D.Scene.loadNextFrame();

      this._hideInput();
      this._timer.destroy('input');
    }
  }
}

export default new Input();
