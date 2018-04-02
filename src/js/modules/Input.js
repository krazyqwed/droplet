import Timer from './Timer'; 

class Input {
  constructor() {
    this._options = false;

    this._events = {};
    this._events.confirmInput = this._confirmInput.bind(this);

    this._timer = new Timer();
    this._timer.addEvent('show', {
      onTick: this._showEvent.bind(this),
      tickLimit: 45
    });
    this._timer.addEvent('input', {
      onTick: this._inputEvent.bind(this),
      tickLimit: 24
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

    this._timer.startEvent('input');
  }

  _showInput() {
    D.HTMLState.set('gui.input.enabled', false);
    D.HTMLState.set('gui.input.visible', true);
    D.HTMLState.set('gui.input.value', '');

    const currentValue = D.Variable.get(this._options.store);

    if (currentValue) {
      D.HTMLState.set('gui.input.value', currentValue);
    }

    this._timer.startEvent('show');
  }

  _hideInput() {
    D.HTMLState.set('gui.input.visible', false);
  }

  _showEvent(state) {
    if (state.over) {
      D.HTMLState.set('gui.input.enabled', true);
    }
  }

  _inputEvent(state) {
    D.HTMLState.set('gui.input.confirmed', true);

    if (state.over) {
      D.HTMLState.set('gui.input.confirmed', false);
      D.SceneStore.setData('interactionRunning', false);
      D.Scene.loadNextFrame();

      this._hideInput();
    }
  }
}

export default new Input();
