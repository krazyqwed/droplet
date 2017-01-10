let sampleVariable = {
  test: 'test',
  test_group: {
    inner: 'test inner',
    inner_group: {
      inner: 0
    }
  }
};

class Variable {
  constructor() {
    this._variables = sampleVariable;
  }

  get(name) {
    name = name.split('.');

    let obj = Object.assign({}, this._variables);
    let len = name.length;

    for (let i = 0; i < len - 1; i++) {
      obj = obj[name[i]];
    }

    return obj[name[len - 1]];
  }

  set(name, value, _obj) {
    if (!_obj) {
      _obj = this._variables;
    }

    if (typeof(name) === 'string') {
      name = name.split('.');
    }

    if (name.length > 1) {
      this.set(name, value, _obj[name.shift()]);
    } else {
      let operator = '';
      let firstChar = value.charAt(0);

      if (firstChar === '-') {
        firstChar = value.charAt(1);
      }
      
      if (/[+\-*\/\^]/.test(firstChar)) {
        operator = firstChar;
        value = value.slice(1);
      }

      switch (operator) {
        case '+': _obj[name[0]] += Number(value); break;
        case '-': _obj[name[0]] -= Number(value); break;
        case '*': _obj[name[0]] *= Number(value); break;
        case '/': _obj[name[0]] /= Number(value); break;
        default: _obj[name[0]] = Number(value);
      }
    }
  }
}

export default new Variable();
