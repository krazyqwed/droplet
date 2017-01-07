class Store {
  constructor() {
    this._data = {};
    this._subscriptions = [];
  }

  getData(name) {
    return this._data[name];
  }

  setData(name, data) {
    let previousValue = this._data[name];
    this._data[name] = data;

    if (this._subscriptions) {
      this._subscriptions.forEach((item) => {
        if (item.name === name && previousValue !== data) {
          item.callback(data, previousValue);
        }
      });
    }
  }

  subscribe(name, callback) {
    this._subscriptions.push({
      name: name,
      callback: callback
    });
  }
}

export default Store;
