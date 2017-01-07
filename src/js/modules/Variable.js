let sampleVariable = {
  test: 'test',
  test_group_1: {
    inner: 'test inner'
  }
};

class Variable {
  constructor() {
    this._variables = sampleVariable;
  }

  get(name) {
    return eval('this._variables.' + name);
  }

  set(name, value) {
    value = value.toString();

    let operator = '';
    const regexp = /[+\-*\/\^]/;
    const firstChar = value.charAt(0);

    if (regexp.test(firstChar)){
      operator = firstChar;
      value = value.slice(1);
    }

    eval('this._variables.' + name + ' ' + operator + '= ' + value);
  }
}

export default new Variable();
