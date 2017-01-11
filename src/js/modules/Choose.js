import Timer from './Timer'; 

class Choose {
  constructor() {
    this._selected = false;
    this._dom = {};
    this._dom.chooseWrap = document.querySelector('.js_choose-wrap');
    this._dom.choose = document.querySelector('.js_choose');
    this._timer = new Timer();
    this._timer.addEvent('chose', this._blinkEvent.bind(this), 1, true, 24);
  }

  showChoose(items, options) {
    this._selected = false;
    D.InteractionStore.setData('interactionRunning', true);

    if (options && options.dialog) {
      D.Text.showTextbox();
      D.Text.loadText(options.dialog, {
        noNext: true
      });
    }

    this._buildItems(items);
    this._showChoose();
  }

  hideChoose() {
    this._hideChoose();
    this._dom.choose.innerHTML = '';
  }

  _buildItems(items) {
    items.forEach((item) => {
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

    this._timer.start('chose', {
      item: item,
      itemElement: elem
    });
  }

  _showChoose() {
    this._dom.chooseWrap.classList.remove('d_gui-element--no-fade');
    this._dom.chooseWrap.classList.add('d_gui-element--visible');
  }

  _hideChoose(fade = true) {
    if (fade) {
      this._dom.chooseWrap.classList.remove('d_gui-element--visible');
    } else {
      this._dom.chooseWrap.classList.add('d_gui-element--no-fade');
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

      if (item.goTo) {
        if (item.goTo.scene) {
          D.Story.loadScene(item.goTo.scene);
        } else {
          D.Scene.loadKeyframeById(item.goTo.keyframe);
        }
      }

      D.InteractionStore.setData('interactionRunning', false);

      this._hideChoose();
      this._timer.destroy('chose');
    }
  }
}

export default new Choose();
