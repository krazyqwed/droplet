class Store {
  getData(name) {
    return this._data[name];
  }

  setData(name, data) {
    this._data[name] = data;
  }
}

export default Store;
