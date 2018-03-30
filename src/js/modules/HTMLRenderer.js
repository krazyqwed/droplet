import hyperHTML from 'hyperhtml';

import mainTemplate from '../templates/main';

class HTMLRenderer {
  constructor() {
    this._container = null;
    this._renderer = null;
    this._state = null;
  }

  set container(container) {
    this._container = container;
    this._renderer = hyperHTML.bind(this._container);
  }

  set state(state) {
    this._state = state;
  }

  render() {
    mainTemplate(this._renderer, this._state);
  }
}

export default new HTMLRenderer();
