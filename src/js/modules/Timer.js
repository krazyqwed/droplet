class Timer {
  constructor() {
    this._defaultOptions = {
      name: '',
      running: false,
      callback: false,
      callbackEvery: false,
      tickRate: 1,
      repeat: true,
      params: {},
      over: false,
      runCount: 0,
      runLimit: 0,
      ticker: 0,
      useMillisec: false
    };

    this._events = [];

    this._tick();
    this._tickMillisec();
  }

  addEvent(name, options) {
    const event = Object.assign({}, this._defaultOptions, options, { name: name });
    this._events.push(event);

    return event;
  }

  start(name, options = {}, params = {}) {
    for (let i in this._events) {
      if (this._events[i].name === name && !this._events[i].running) {
        this._events[i] = Object.assign(this._events[i], options);
        this._events[i].params = Object.assign(this._events[i].params, params);
        this._events[i].over = false;
        this._events[i].runCount = 0;
        this._events[i].running = true;
        this._events[i].ticker = this._events[i].useMillisec ? new Date().getTime() : 0;
        this._events[i].timeLimit = new Date().getTime();
      }
    }
  }

  stop(name) {
    for (let i in this._events) {
      if (this._events[i].name === name && this._events[i].running) {
        this._events[i].running = false;
      }
    }
  }

  over(name) {
    for (let i in this._events) {
      if (this._events[i].name === name && this._events[i].running) {
        this._events[i].over = true;
        this._events[i].running = false;

        if (this._events[i].callback) {
          this._events[i].callback(this._events[i]);
        }

        if (this._events[i].callbackEvery) {
          this._events[i].callbackEvery(this._events[i]);
        }
      }
    }
  }

  destroy(name) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].over = true;
        this._events[i].running = false;
        this._events[i].runCount = 0;
        this._events[i].ticker = 0;
      }
    }
  }

  setTickRate(name, rate) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].ticker = 0;
        this._events[i].tickRate = rate;
      }
    }
  }

  setRunLimit(name, limit) {
    for (let i in this._events) {
      if (this._events[i].name === name) {
        this._events[i].runLimit = limit;
      }
    }
  }

  _tick() {
    requestAnimationFrame(() => {
      for (let i in this._events) {
        if (this._events[i].useMillisec) {
          continue;
        }

        this._tickFunction(this._events[i]);
      }

      this._tick();
    });
  }

  _tickFunction(event) {
    if (!event.running || event.over || event.tickRate === 0) {
      return;
    }

    event.ticker++;

    if (event.ticker % event.tickRate === 0) {
      event.runCount++;

      if (!event.repeat || (event.repeat && event.runCount === event.runLimit)) {
        event.over = true;
        event.running = false;
      }

      event.callback(event);
    }

    if (event.callbackEvery) {
      event.callbackEvery(event);
    }

    if (event && event.ticker == event.tickRate) {
      event.ticker = 0;
    }
  }

  _tickMillisec() {
    setTimeout(() => {
      for (let i in this._events) {
        if (!this._events[i].useMillisec) {
          continue;
        }

        this._tickMillisecFunction(this._events[i]);
      }

      this._tickMillisec();
    }, 1);
  }

  _tickMillisecFunction(event) {
    const time = new Date().getTime();
    const lastTime = event.ticker;

    if (!event.running || event.over || event.tickRate === 0) {
      return;
    }

    if (time - lastTime >= event.tickRate) {
      event.ticker = time;
      event.callback(event);
    }

    if (event.callbackEvery) {
      event.callbackEvery(event);
    }

    if (event.runLimit > 0 && time - event.timeLimit >= event.runLimit) {
      event.over = true;
      event.running = false;
      event.callback(event);
    }
  }
}

export default Timer;
