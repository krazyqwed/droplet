class Event {
  constructor(options, params) {
    this._defaultOptions = {
      tickLimit: false,
      tickRate: 1,
      repeat: false,
      onTick: () => {}
    };

    this._options = Object.assign({}, this._defaultOptions, options);
    this._params = Object.assign({}, this._params, params);

    this._state = {};
    this._state.tickCount = 0;
    this._state.over = false;

    this._elapsedTime = 0;

    this._ticker = new PIXI.Ticker();
    this._ticker.autoStart = false;
    this._ticker.speed = this._options.tickRate;
    this._ticker.stop();

    this._ticker.add(time => {
      this._elapsedTime += time;

      if (Math.floor(this._elapsedTime) >= 1) {
        const elapsedTicks = Math.round(this._elapsedTime);

        for (let i = 0; i < elapsedTicks && !this._state.over; ++i) {
          this._state.tickCount++;
          this._tick();
        }

        this._elapsedTime = 0;
      }
    });
  }

  set options(options) {
    this._options = Object.assign({}, this._options, options);
    this._ticker.speed = this._options.tickRate;
  }

  set params(params) {
    this._params = Object.assign({}, this._params, params);
  }

  start() {
    this._state.over = false;
    this._state.tickCount = 0;
    this._ticker.start();
  }

  stop() {
    this._state.tickCount = 0;
    this._ticker.stop();
  }

  end() {
    if (this._state.over) { return; }

    this._state.over = true;
    
    this._ticker.stop();
    this._callOnTick();
  }

  _tick() {
    if (this._options.tickLimit !== false && this._state.tickCount >= this._options.tickLimit) {
      this._state.over = true;
      this.stop();

      if (this._options.repeat) {
        this.start();
      }
    }

    this._callOnTick();
  }

  _callOnTick() {
    this._options.onTick(this._state, this._options, this._params);
  }
}

class Timer {
  constructor() {
    this._events = {};
  }

  addEvent(name, options, params) {
    this._events[name] = new Event(options, params);
  }

  setEventOptions(name, options) {
    this._events[name].options = options;
  }

  setEventParams(name, params) {
    this._events[name].params = params;
  }

  startEvent(name) {
    this._events[name].start();
  }

  stopEvent(name) {
    this._events[name].stop();
  }

  endEvent(name) {
    this._events[name].end();
  }
}

export default Timer;
