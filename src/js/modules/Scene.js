class Scene {
  init() {
    this._load();
  }

  _input() {
    window.addEventListener('keydown', (event) => {
      switch(event.which) {
        case 32: this._fastForward(); break;
      }
    }, false);
  }

  _fastForward() {
    window.sceneStore.setData('fastForward', true);
  }

  _load() {
    this._update();
  }

  _update() {
    window.meter.tickStart();

    requestAnimationFrame(() => {


      this._render();
      this._update();
    });
  }

  _render() {
    window.meter.tick();
    window.renderer.render(window.stage);
  }
}

export default new Scene();
