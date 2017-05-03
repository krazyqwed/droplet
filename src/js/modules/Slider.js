class State {
  constructor() {
    this._min = 0;
    this._max = 100;
    this._step = 1;
    this._rawValue = [50];
    this._value = this._rawValue;

    this._isValueSet = false;
    this._range = false;
  }

  set value(value) {
    this._isValueSet = true;
    this._value = this._setValueAsArray(value);
    this._rawValue = this._value;
    this._value = this._makeValidValue(this._value);
  }

  get value() {
    return this._value;
  }

  set range(value) {
    this._range = value;

    if (this.range) {
      if (this.value.length === 1) {
        this.value = [this._min, this._isValueSet ? this.value[0] : this._max];
      }

      this._rawValue = this._isValueSet ? this.value : [this._min, this._max];
      this._value = this._rawValue;
    }
  }

  get range() {
    return this._range;
  }

  set min(value) {
    this._min = this._setNumericValue(value, '_min');
    this._value = this._makeValidValue(this._rawValue);
  }

  get min() {
    return this._min;
  }

  set max(value) {
    this._max = this._setNumericValue(value, '_max');
    this._value = this._makeValidValue(this._rawValue);
  }

  get max() {
    return this._max;
  }

  set step(value) {
    this._step = this._setNumericValue(value, '_step');
    this._value = this._makeValidValue(this._rawValue);
  }

  get step() {
    return this._step;
  }

  get percent() {
    return this._value.map(value => 100 * (value - this._min) / (this._max - this._min));
  }

  update(index, value) {
    let tempValue = this.value;
    tempValue[index] = value;

    this.value = tempValue.join(',');
  }

  _setValueAsArray(value) {
    const arrayValue = value.toString().split(',');
    const parsedValue = arrayValue.map((item) => this._setNumericValue(item, '_value'));
    return parsedValue;
  }

  _setNumericValue(value, property) {
    const parsedValue = parseInt(value);
    return !isNaN(parsedValue) ? parsedValue : this[property];
  }

  _makeValidValue(valueArray) {
    if (!this._isValueSet) {
      return valueArray.length === 1 ? [(this._min + this._max) / 2] : [this._min, this._max];
    }

    const valueInsideBoundaries = [];

    valueArray.forEach(value => {
      const currentStep = Math.round((value - this._min) / this._step);
      valueInsideBoundaries.push(this._forceInsideValueBoundaries(this._step * currentStep + this._min));
    });

    return valueInsideBoundaries.sort((a, b) => a - b);
  }

  _forceInsideValueBoundaries(value) {
    if (value < this._min) {
      return this._min;
    } else if (value > this._max) {
      return this._max;
    }

    return value;
  }
}

class DSlider extends HTMLElement {
  constructor() {
    super();

    this._events = {};
    this._events.mouseDownHandler = this._handleMouseDown.bind(this);
    this._events.mouseMoveHandler = this._handleMouseMove.bind(this);
    this._events.mouseUpHandler = this._handleMouseUp.bind(this);
    this._events.mouseScrollHandler = this._handleMouseScroll.bind(this);
    this._events.keyDownHandler = this._handleKeyDown.bind(this);

    this._isMouseDown = false;
    this._mouseDownValue = 0;
    this._focusedBubbleIndex = 0;
    this._disabled = false;
    this._showSteps = false;
    this._noBubble = false;
    this._range = false;
    this._state = new State();

    this._dom = {};
    this._dom.bubbles = [];
    this._dom.slider = this._createElement('div', 'd-slider');
    this._dom.line = this._createElement('div', 'd-slider__line');
    this._dom.steps = this._createElement('div', 'd-slider__steps');
    this._dom.fill = this._createElement('div', 'd-slider__fill');
    this._dom.minLabel = this._createElement('div', 'd-slider__label d-slider__label-min');
    this._dom.maxLabel = this._createElement('div', 'd-slider__label d-slider__label-max');

    this._dom.line.appendChild(this._dom.fill);
    this._dom.line.appendChild(this._dom.steps);
    this._dom.slider.appendChild(this._dom.line);
    this._dom.slider.appendChild(this._dom.minLabel);
    this._dom.slider.appendChild(this._dom.maxLabel);

    this._appendBubble();
    this._registerClickOnLine();
  }

  connectedCallback() {
    this._refresh();
    this.appendChild(this._dom.slider);
  }

  disconnectedCallback() {
    this._dom.line.removeEventListener('mousedown', this._events.mouseDownHandler);
    this._dom.bubbles.forEach(bubble => {
      bubble.removeEventListener('mousedown', this._events.mouseDownHandler);
    });
    document.body.removeEventListener('mousemove', this._events.mouseMoveHandler);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    name = name.replace(/-([a-z])/g, g => g[1].toUpperCase());

    this[name] = newValue;
  }

  static get observedAttributes() {
    return ['value', 'min', 'max', 'step', 'show-steps', 'disabled', 'min-label', 'max-label', 'range'];
  }

  set value(value) {
    this._state.value = value;
    this._renderValue();
    this._dispatchEvent();
  }

  get value() {
    return this._state.value.length === 1 ? this._state.value[0] : this._state.value.join(',');
  }

  set min(value) {
    this._state.min = value;
    this._refresh();
  }

  get min() {
    return this._state.min;
  }

  set max(value) {
    this._state.max = value;
    this._refresh();
  }

  get max() {
    return this._state.max;
  }

  set step(value) {
    this._state.step = value;
    this._refresh();
  }

  get step() {
    return this._state.step;
  }

  set showSteps(value) {
    this._showSteps = this._convertAttributeToBoolean(value);
    this._renderSteps();
  }

  get showSteps() {
    return this._showSteps;
  }

  set disabled(value) {
    this._disabled = this._convertAttributeToBoolean(value);
  }

  get disabled() {
    return this._disabled;
  }

  set minLabel(value) {
    this._dom.minLabel.textContent = value;
  }

  get minLabel() {
    return this._dom.minLabel.textContent;
  }

  set maxLabel(value) {
    this._dom.maxLabel.textContent = value;
  }

  get maxLabel() {
    return this._dom.maxLabel.textContent;
  }

  set range(value) {
    this._range = this._convertAttributeToBoolean(value);
    this._state.range = this.range;

    this.range ? this._appendSecondBubble() : this._removeSecondBubble();

    this._renderValue();
  }

  get range() {
    return this._range;
  }

  _createElement(name, className) {
    const element = document.createElement(name);
    element.className = className;
    return element;
  }

  _appendBubble() {
    const bubble = this._createBubbleElement();
    this._dom.slider.appendChild(bubble);
    this._dom.bubbles.push(bubble);

    const bubbleIndex = this._dom.bubbles.indexOf(bubble);

    this._registerBubbleControls(bubble, bubbleIndex);
  }

  _registerBubbleControls(bubble, bubbleIndex) {
    this._registerBubbleHover(bubble);
    this._registerBubbleFocus(bubble, bubbleIndex);
    this._registerBubbleBlur(bubble);
    this._registerDragHandlers(bubble);
    this._registerKeyboardHandlers(bubble);
  }

  _appendSecondBubble() {
    if (this._dom.bubbles.length === 1) {
      this._appendBubble();
    }
  }

  _removeSecondBubble() {
    if (this._dom.bubbles.length === 2) {
      const bubble = this._dom.bubbles[1];
      bubble.parentNode.removeChild(bubble);
      this._dom.bubbles.pop();
    }
  }

  _createBubbleElement() {
    const bubble = document.createElement('div');
    bubble.classList.add('d-slider__bubble');
    bubble.setAttribute('tabindex', 0);

    return bubble;
  }

  _registerBubbleHover(bubble) {
    bubble.addEventListener('mouseenter', () => {
      bubble.classList.add('d-slider__bubble--hover');
    });
    bubble.addEventListener('mouseleave', () => bubble.classList.remove('d-slider__bubble--hover'));
  }

  _registerBubbleFocus(bubble, bubbleIndex) {
    bubble.addEventListener('mousedown', bubble.focus);
    bubble.addEventListener('focus', () => {
      this._focusedBubbleIndex = bubbleIndex;
      bubble.classList.add('d-slider__bubble--active');
    });
  }

  _registerBubbleBlur(bubble) {
    bubble.addEventListener('blur', () => {
      bubble.classList.remove('d-slider__bubble--active');
    });
  }

  _registerClickOnLine() {
    this._dom.line.addEventListener('mousedown', this._events.mouseDownHandler);
    this.addEventListener('mousewheel', this._events.mouseScrollHandler);
    this.addEventListener('DOMMouseScroll', this._events.mouseScrollHandler);
  }

  _registerDragHandlers(bubble) {
    bubble.addEventListener('mousedown', this._events.mouseDownHandler);
  }

  _handleMouseDown(event) {
    const isCorrectMouseButton = event.which === 1;
    if (!isCorrectMouseButton || this._disabled) {
      return;
    }

    this._isMouseDown = true;
    this._mouseDownValue = this._state.value[this._focusedBubbleIndex];

    const isLine = !event.target.classList.contains('d-slider__bubble');

    if (isLine) {
      if (this.range) {
        const positionValue = this._calculatePositionFromEvent(event.clientX);
        const middleValue = this._getMiddleValueFromState();

        this._focusedBubbleIndex = positionValue < middleValue ? 0 : 1;
      }

      this._events.mouseMoveHandler(event, isLine);
    }

    setTimeout(() => this._dom.bubbles[this._focusedBubbleIndex || 0].focus());

    document.body.addEventListener('mousemove', this._events.mouseMoveHandler);
    document.body.addEventListener('mouseup', this._events.mouseUpHandler);
    document.body.classList.add('noselect');
  }

  _getMiddleValueFromState() {
    const currentValue = this._state.value;
    return (currentValue[1] - currentValue[0]) / 2 + currentValue[0];
  }

  _handleMouseMove(event, isLine) {
    if (!this._isMouseDown) {
      return;
    }

    const positionValue = this._calculatePositionFromEvent(event.clientX);
    this._changeFocusAccordingToPosition(positionValue);
    this._updateFocusedPosition(positionValue);

    const isPositionChanged = positionValue === this._lastStoredValue;
    if (!isPositionChanged && !isLine) {
      this._lastStoredValue = positionValue;
      this._dispatchEvent();
    }
  }

  _handleMouseUp() {
    document.body.removeEventListener('mousemove', this._events.mouseMoveHandler);
    document.body.removeEventListener('mouseup', this._events.mouseUpHandler);
    document.body.classList.remove('noselect');

    this._isMouseDown = false;
    this._lastStoredValue = false;
    this._dispatchEvent();
  }

  _handleMouseScroll(event) {
    const realEvent = window.event || event;
    const delta = Math.max(-1, Math.min(1, (realEvent.wheelDelta || -realEvent.detail))) * 3;
    const positionValue = delta + this._state.value[this._focusedBubbleIndex];
    this._changeFocusAccordingToPosition(positionValue);
    this._updateFocusedPosition(positionValue);
    this._dispatchEvent();
  }

  _calculatePositionFromEvent(position) {
    const { left, width } = this._dom.line.getBoundingClientRect();
    const percentageOfMousePosition = (position - left) / width;
    return Math.round(this._state.min + percentageOfMousePosition * (this._state.max - this._state.min));
  }

  _registerKeyboardHandlers(bubble) {
    bubble.addEventListener('keydown', this._events.keyDownHandler);
  }

  _handleKeyDown(event) {
    if (this._disabled) {
      return;
    }

    const keyCodeMap = {
      37: 'minus1',
      40: 'minus1',
      38: 'plus1',
      39: 'plus1',
      33: 'plus10percent',
      34: 'minus10percent',
      35: 'max',
      36: 'min',
      27: 'esc'
    };

    const navigationFn = keyCodeMap[event.keyCode];

    if (!navigationFn) {
      return;
    }

    event.preventDefault();

    const currentValue = this._state.value[this._focusedBubbleIndex];
    const navigation = {
      plus1: () => currentValue + this._state.step,
      minus1: () => currentValue - this._state.step,
      plus10percent: () => currentValue + Math.round((this._state.max - this._state.min) / 10),
      minus10percent: () => currentValue - Math.round((this._state.max - this._state.min) / 10),
      max: () => this._state.max,
      min: () => this._state.min,
      esc: () => {
        this._isMouseDown = false;
        this._dom.bubbles[this._focusedBubbleIndex].blur();

        return this._mouseDownValue;
      }
    };

    const positionValue = navigation[navigationFn]();
    this._changeFocusAccordingToPosition(positionValue);
    this._updateFocusedPosition(positionValue);
    this._dispatchEvent();
  }

  _changeFocusAccordingToPosition(positionValue) {
    if (this.range) {
      const nonFocusedBubbleIndex = +!this._focusedBubbleIndex;
      const nonFocusedBubbleValue = this._state.value[nonFocusedBubbleIndex];
      const isLargerNow = this._focusedBubbleIndex === 0 && positionValue > nonFocusedBubbleValue;
      const isSmallerNow = this._focusedBubbleIndex === 1 && positionValue < nonFocusedBubbleValue;

      if (isLargerNow || isSmallerNow) {
        this._state.update(this._focusedBubbleIndex, positionValue);
        this._focusedBubbleIndex = nonFocusedBubbleIndex;
      }
    }

    this._dom.bubbles[this._focusedBubbleIndex].focus();
  }

  _updateFocusedPosition(positionValue) {
    const index = !this._range ? 0 : this._focusedBubbleIndex;
    this._state.update(index, positionValue);
    this._renderValue();
  }

  _refresh() {
    this._renderValue();
    this._renderSteps();
  }

  _renderValue() {
    const valuesCount = this._state.value.length;
    const bubblesCount = this._dom.bubbles.length;
    if (valuesCount !== bubblesCount) {
      return;
    }

    this._dom.fill.style.width = this._state.percent[0] + '%';
    this._dom.fill.style.left = '0%';

    if (this.range) {
      this._dom.fill.style.width = (this._state.percent[1] - this._state.percent[0]) + '%';
      this._dom.fill.style.left = this._state.percent[0] + '%';
    }

    this._dom.bubbles.forEach((bubble, i) => {
      bubble.style.left = this._state.percent[i] + '%';
    });
  }

  _renderSteps() {
    this._dom.steps.innerHTML = '';

    if (!this._showSteps) {
      return;
    }

    const lengthOfStep = 100 * this._state.step / (this._state.max - this._state.min);

    for (let i = lengthOfStep; i < 100; i += lengthOfStep) {
      const stepElement = this._createElement('div', 'd-slider__step');
      stepElement.style.left = i + '%';
      this._dom.steps.appendChild(stepElement);
    }
  }

  _dispatchEvent() {
    const eventDetails = {
      value: this.value,
      inprogress: this._isMouseDown
    };

    const rangeValues = this.range ? {
      lowValue: this._state.value[0],
      highValue: this._state.value[1]
    } : {};

    const updateEvent = new CustomEvent('update', {
      detail: Object.assign(eventDetails, rangeValues)
    });
    this.dispatchEvent(updateEvent);
  }

  _convertAttributeToBoolean(value) {
    return value !== 'false' && value !== undefined;
  }
}

customElements.define('d-slider', DSlider);

export default DSlider;
