class Timer {
  constructor() {
    this._events = [];
    this._ticker = 0;

    this._tick();
  }

  addEvent(name, callback, tickRate, repeat, runLimit) {
    let event = {
      name: name,
      running: false,
      callback: callback,
      params: false,
      tickRate: tickRate ? tickRate : 1,
      repeat: repeat ? repeat : false,
      over: false,
      runCount: 0,
      runLimit: runLimit ? runLimit : 0,
      ticker: 0
    };

    this._events.push(event);

    return event;
  }

  start(name, params) {
    for (let i in this._events) {
      if (this._events[i].name === name && !this._events[i].running) {
        this._events[i].over = false;
        this._events[i].runCount = 0;
        this._events[i].running = true;
        this._events[i].ticker = 0;

        if (params) {
          this._events[i].params = params;
        } else {
          this._events[i].params = false;
        }
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
        this._events[i].callback(this._events[i]);
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
        if (this._events[i].running && !this._events[i].over) {
          this._events[i].ticker++;

          if (this._events[i].ticker % this._events[i].tickRate === 0) {
            this._events[i].runCount++;

            if (!this._events[i].repeat || (this._events[i].repeat && this._events[i].runCount === this._events[i].runLimit)) {
              this._events[i].over = true;
            }

            this._events[i].callback(this._events[i]);
          }

          if (this._events[i] && this._events[i].ticker == this._events[i].tickRate) {
            this._events[i].ticker = 0;
          }
        }
      }

      this._tick();
    });
  }
}

export default Timer;
