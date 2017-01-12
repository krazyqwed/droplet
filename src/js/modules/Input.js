import Timer from './Timer'; 

class Input {
  constructor() {
    this._inputted = false;
    this._store = false;
    this._dom = {};
    this._dom.inputWrap = document.querySelector('.js_input-wrap');
    this._dom.input = document.querySelector('.js_input');
    this._dom.inputButton = document.querySelector('.js_input_button');
    this._timer = new Timer();
    this._timer.addEvent('input', this._inputEvent.bind(this), 1, true, 24);
  }

  showInput(store, options) {
    this._inputted = false;
    D.InteractionStore.setData('interactionRunning', true);

    this._store = store;

    if (options && options.dialog) {
      D.Text.showTextbox();
      D.Text.loadText(options.dialog, {
        noNext: true
      });
    }

    const currentValue = D.Variable.get(this._store);

    if (currentValue) {
      this._dom.input.value = currentValue;
    }

    this._showInput();
  }

  hideInput() {
    this._hideInput();
    this._dom.input.value = '';
  }

  confirmInput(store) {
    if (this._inputted) {
      return;
    }

    this._inputted = true;

    D.Variable.set(this._store, this._dom.input.value, 'string');

    this._dom.input.blur();
    this._dom.inputButton.blur();

    this._timer.start('input');
  }

  _showInput() {
    this._dom.inputWrap.classList.remove('d_gui-element--no-fade');
    this._dom.inputWrap.classList.add('d_gui-element--visible');
    this._dom.input.focus();
  }

  _hideInput(fade = true) {
    if (fade) {
      this._dom.inputWrap.classList.remove('d_gui-element--visible');
    } else {
      this._dom.inputWrap.classList.add('d_gui-element--no-fade');
    }
  }

  _inputEvent(event) {
    if (event.runCount === 1) {
      this._dom.inputButton.classList.add('d_button--success');
    }

    if (event.over) {
      this._dom.inputButton.classList.remove('d_button--success');

      D.InteractionStore.setData('interactionRunning', false);

      this._hideInput();
      this._timer.destroy('input');
    }
  }
}

export default new Input();
