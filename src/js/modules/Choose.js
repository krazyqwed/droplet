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
      D.Text.showTextBox();
      D.Text.loadText(options.dialog, {
        noNext: true
      });
    }

    this._buildItems(items);
    this._showChooseBox();
  }

  _buildItems(items) {
    items.forEach((item) => {
      let itemElement = document.createElement('div');
      itemElement.className = 'b_choose__item';
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

    item.classList.add('b_choose__item--active');
  }

  _unsetActive(item) {
    if (this._selected) {
      return;
    }

    item.classList.remove('b_choose__item--active');
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
      item: elem
    });
  }

  _showChooseBox() {
    this._dom.chooseWrap.classList.add('b_choose-wrap--visible');
  }

  _hideChooseBox() {
    this._dom.chooseWrap.classList.remove('b_choose-wrap--visible');
  }

  _blinkEvent(event) {
    const item = event.params.item;

    if (event.runCount === 1) {
      item.classList.add('b_choose__item--blink');
    }

    if (event.over) {
      item.classList.remove('b_choose__item--blink');
      D.InteractionStore.setData('interactionRunning', false);
      this._hideChooseBox();
      this._timer.destroy('chose');
    }
  }
}

export default new Choose();
