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
          item.callback(data, previousValue, name);
        }
      });
    }
  }

  subscribe(name, callback) {
    let subscription = {
      id: Math.random().toString(36).substring(7),
      name: name,
      callback: callback
    };

    subscription.unsubscribe = this.__unsubscribe.bind(subscription, this);

    this._subscriptions.push(subscription);

    return subscription;
  }

  __unsubscribe(store) {
    store._subscriptions.forEach((item, index) => {
      if (item.id === this.id) {
        delete store._subscriptions[index];
      }
    });
  }
}

export default Store;
