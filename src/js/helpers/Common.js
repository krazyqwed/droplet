class CommonHelper {
  requestTimeout(fn, delay) {
    const start = new Date().getTime();
    let handle = {};
    
    function loop() {
      const current = new Date().getTime();
      const delta = current - start;

      if (delta >= delay) {
        fn.call();
      } else {
        handle.value = window.requestAnimationFrame(loop);
      }
    }

    handle.value = window.requestAnimationFrame(loop);
    return handle;
  }

  clearRequestTimeout(handle) {
    window.cancelAnimationFrame(handle.value);
  }
  
  requestInterval(fn, delay) {
    let start = new Date().getTime();
    let handle = {};

    function loop() {
      const current = new Date().getTime();
      const delta = current - start;

      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }

      handle.value = window.requestAnimationFrame(loop);
    }

    handle.value = window.requestAnimationFrame(loop);
    return handle;
  }

  clearRequestInterval(handle) {
    window.cancelAnimationFrame(handle.value);
  }
}

export default new CommonHelper();