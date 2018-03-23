class ResourceLoader {
  constructor() {
    this.reset();
  }

  reset() {
    this._loader = new Loader('static/');
    this._onBefore = function() {};
    this._onAfter = function() {};
    this._onProgress = function() {};
    this._onComplete = function() {};
  }

  load(assets) {
    if (typeof assets === 'object') {
      assets.forEach((asset) => {
        this._processAsset(asset);
      });
    } else {
      this._processAsset(assets);
    }

    this._loader.load();
  }

  on(state, callback) {
    switch(state) {
      case 'before': this._onBefore = callback; this._loader.pre(this._onBefore.bind(this)); break;
      case 'after': this._onAfter = callback; this._loader.use(this._onAfter.bind(this)); break;
      case 'progress': this._onProgress = callback; this._loader.onProgress.add(this._onProgress.bind(this)); break;
      case 'complete': this._onComplete = callback; this._loader.onComplete.add(this._onComplete.bind(this)); break;
    }
  }

  _processAsset(asset) {
    this._loader.add(asset, asset);
  }
}

export default new ResourceLoader();
