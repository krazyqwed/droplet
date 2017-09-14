import Timer from './Timer'; 

class Input {
  constructor() {
    this._options = false;
    this._inputted = false;

    this._dom = {};
    this._dom.inputWrap = document.querySelector('.js_input-wrap');
    this._dom.input = document.querySelector('.js_input');
    this._dom.inputButton = document.querySelector('.js_input_button');

    this._timer = new Timer();
    this._timer.addEvent('show', {
      callback: this._showEvent.bind(this),
      runLimit: 45
    });
    this._timer.addEvent('input', {
      callback: this._inputEvent.bind(this),
      runLimit: 24
    });

    window.addEventListener('mousedown', (event) => {
      if (event.target.classList.contains('js_input_button')) {
        this._confirmInput();
      }
    });
  }

  handleAction(options) {
    this._options = options;
    this._inputted = false;
    D.SceneStore.setData('interactionRunning', true);

    const currentValue = D.Variable.get(this._options.store);

    if (currentValue) {
      this._dom.input.value = currentValue;
    }

    this._showInput();
  }

  clearInput() {
    this._hideInput();
    this._dom.input.value = '';
  }

  _confirmInput() {
    if (this._inputted) {
      return;
    }

    this._inputted = true;

    D.Variable.set(this._options.store, this._dom.input.value, 'string');

    this._dom.input.blur();
    this._dom.inputButton.blur();

    this._timer.start('input');
  }

  _showInput() {
    this._dom.inputWrap.classList.add('d_gui-element--disable');
    this._dom.inputWrap.offsetHeight;
    this._dom.inputWrap.classList.remove('d_gui-element--no-fade');
    this._dom.inputWrap.classList.add('d_gui-element--visible');
    this._dom.input.focus();

    this._timer.start('show');
  }

  _hideInput() {
    this._dom.inputWrap.classList.remove('d_gui-element--visible');
  }

  _showEvent(event) {
    if (event.over) {
      this._dom.inputWrap.classList.remove('d_gui-element--disable');
      this._timer.destroy('show');
    }
  }

  _inputEvent(event) {
    if (event.runCount === 1) {
      this._dom.inputButton.classList.add('d_button--success');
    }

    if (event.over) {
      this._dom.inputButton.classList.remove('d_button--success');

      D.SceneStore.setData('interactionRunning', false);

      D.Scene.loadNextFrame();

      this._hideInput();
      this._timer.destroy('input');
    }
  }
}

export default new Input();
