import Timer from './Timer'; 

class Choose {
  constructor() {
    this._options = false;

    this._events = {};
    this._events.mouseenter = this._setActive.bind(this);
    this._events.mouseleave = this._unsetActive.bind(this);
    this._events.select = this._select.bind(this);

    this._timer = new Timer();
    this._timer.addEvent('show', {
      callback: this._showEvent.bind(this),
      runLimit: 45
    });
    this._timer.addEvent('chose', {
      callback: this._blinkEvent.bind(this),
      runLimit: 24
    });
  }

  init() {
    D.HTMLState.set('gui.choose.event.mouseenter', this._events.mouseenter);
    D.HTMLState.set('gui.choose.event.mouseleave', this._events.mouseenter);
    D.HTMLState.set('gui.choose.event.select', this._events.select);
  }

  handleAction(options) {
    this._options = options;
    this._selected = false;
    D.SceneStore.setData('interactionRunning', true);

    this._showChoose();
  }

  _setActive(option) {
    D.HTMLState.set('gui.choose.activeItem', option.index);
  }

  _unsetActive() {
    D.HTMLState.set('gui.choose.activeItem', false);
  }

  _select(item, elem) {
    D.HTMLState.set('gui.choose.enabled', false);

    if (item.variable) {
      item.variable.forEach(variable => {
        D.Variable.set(variable.name, variable.value);
      });
    }

    this._timer.start('chose', {}, {
      item: item,
      itemElement: elem
    });
  }

  _showChoose() {
    this._options.items = this._options.items.map((option, index) => Object.assign(option, { index: index }));

    D.HTMLState.set('gui.choose.enabled', false);
    D.HTMLState.set('gui.choose.visible', true);
    D.HTMLState.set('gui.choose.items', this._options.items);

    this._timer.start('show');
  }

  _hideChoose() {
    D.HTMLState.set('gui.choose.visible', false);
  }

  _showEvent(event) {
    if (event.over) {
      D.HTMLState.set('gui.choose.enabled', true);
      this._timer.destroy('show');
    }
  }

  _blinkEvent(event) {
    const item = event.params.item;

    D.HTMLState.set('gui.choose.selectedItem', item.index);

    if (event.over) {
      D.HTMLState.set('gui.choose.selectedItem', false);
      D.SceneStore.setData('interactionRunning', false);

      this._hideChoose();

      if (item.goTo) {
        D.Goto.handleAction(item.goTo);
      } else {
        D.SceneStore.setData('autoContinue', true, false);
        D.SceneStore.triggerCallback('autoContinue');
      }

      this._timer.destroy('chose');
    }
  }
}

export default new Choose();
