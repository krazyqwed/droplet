import sampleVariables from '../sample_variables';

class Variable {
  constructor() {
    this._variables = sampleVariables;
  }

  handleAction(action) {
    action.variables.forEach((variable) => {
      this.set(variable.name, variable.value, variable.type);
    });
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

  set(name, value, type = 'number', _obj) {
    if (!_obj) {
      _obj = this._variables;
    }

    if (typeof(name) === 'string') {
      name = name.split('.');
    }

    if (name.length > 1) {
      this.set(name, value, type, _obj[name.shift()]);
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
        case '+': _obj[name[0]] += _obj[name[0]] = type === 'string' ? value.toString() : Number(value); break;
        case '-': _obj[name[0]] -= Number(value); break;
        case '*': _obj[name[0]] *= Number(value); break;
        case '/': _obj[name[0]] /= Number(value); break;
        default: _obj[name[0]] = type === 'string' ? value : Number(value);
      }
    }
  }

  if(expression) {
    const equation = expression.match(/(.*) ([!><=]+) (.*)/);
    const variable = this.get(equation[1]);
    let result = false;

    switch (equation[2]) {
      case '=': result = variable == equation[3]; break;
      case '!=': result = variable != equation[3]; break;
      case '>': result = variable > Number(equation[3]); break;
      case '<': result = variable < Number(equation[3]); break;
      case '>=': result = variable >= Number(equation[3]); break;
      case '<=': result = variable <= Number(equation[3]); break;
    }

    return result;
  }

  getState() {
    return this._variables;
  }

  setState(data) {
    this._variables = data;
  }
}

export default new Variable();
