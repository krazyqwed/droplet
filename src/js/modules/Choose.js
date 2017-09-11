import Timer from './Timer'; 

class Choose {
  constructor() {
    this._action = false;
    this._selected = false;

    this._dom = {};
    this._dom.chooseWrap = document.querySelector('.js_choose_wrap');
    this._dom.choose = document.querySelector('.js_choose');

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

  handleAction(action) {
    this._action = action;
    this._selected = false;
    D.SceneStore.setData('interactionRunning', true);

    this._buildItems();
    this._showChoose();
  }

  clearChoose() {
    this._hideChoose();
    this._dom.choose.innerHTML = '';
  }

  _buildItems() {
    this._action.items.forEach((item) => {
      let itemElement = document.createElement('div');
      itemElement.className = 'd_choose__item';
      itemElement.innerHTML = item.text;
      itemElement.addEventListener('mouseenter', this._setActive.bind(this, itemElement));
      itemElement.addEventListener('mouseleave', this._unsetActive.bind(this, itemElement));
      itemElement.addEventListener('click', this._select.bind(this, item, itemElement));

      this._dom.choose.appendChild(itemElement);
    });
  }

  _setActive(item) {
    if (this._selected) {
      return;
    }

    item.classList.add('d_choose__item--active');
  }

  _unsetActive(item) {
    if (this._selected) {
      return;
    }

    item.classList.remove('d_choose__item--active');
  }

  _select(item, elem) {
    if (this._selected) {
      return;
    }

    this._selected = true;

    if (item.variable) {
      item.variable.forEach((variable) => {
        D.Variable.set(variable.name, variable.value);
      });
    }

    this._timer.start('chose', {}, {
      item: item,
      itemElement: elem
    });
  }

  _showChoose() {
    this._dom.chooseWrap.classList.add('d_gui-element--disable');

    this._dom.chooseWrap.offsetHeight;
    this._dom.chooseWrap.classList.remove('d_gui-element--no-fade');
    this._dom.chooseWrap.classList.add('d_gui-element--visible');

    this._timer.start('show');
  }

  _hideChoose() {
    this._dom.chooseWrap.classList.remove('d_gui-element--visible');
  }

  _showEvent(event) {
    if (event.over) {
      this._dom.chooseWrap.classList.remove('d_gui-element--disable');
      this._timer.destroy('show');
    }
  }

  _blinkEvent(event) {
    const item = event.params.item;
    const itemElement = event.params.itemElement;

    if (event.runCount === 1) {
      itemElement.classList.add('d_choose__item--blink');
    }

    if (event.over) {
      itemElement.classList.remove('d_choose__item--blink');

      D.SceneStore.setData('interactionRunning', false);

      if (item.goTo) {
        if (item.goTo.scene) {
          D.Story.loadScene(item.goTo.scene);
        } else {
          D.Scene.loadKeyframeById(item.goTo.keyframe);
        }
      }

      this._hideChoose();
      this._timer.destroy('chose');
    }
  }
}

export default new Choose();
