export default {
  version: '',
  window: {
    width: 0,
    height: 0
  },
  scale: 0,
  wrapper: {
    width: 0,
    height: 0,
    left: 0
  },
  mainMenu: {
    visible: false,
    activeItem: false,
    event: {
      mouseenter: () => {},
      mouseleave: () => {},
      new: () => {},
      load: () => {},
      settings: () => {},
      exit: () => {}
    }
  },
  save: {
    visible: false,
    files: [],
    isSave: false,
    event: {
      back: () => {},
      promptSave: () => {},
      promptLoad: () => {},
      promptDelete: () => {}
    }
  },
  alert: {
    visible: false,
    description: '',
    confirm: '',
    cancel: '',
    event: {
      confirm: () => {},
      cancel: () => {}
    }
  },
  history: {
    visible: false,
    entries: [],
    event: {
      back: () => {}
    }
  },
  settings: {
    visible: false,
    event: {
      back: () => {}
    }
  },
  gui: {
    visible: false,
    activeItem: false,
    gameMenu: {
      visible: false,
      event: {
        showHistory: () => {},
        showSave: () => {},
        showSettings: () => {}
      }
    },
    textbox: {
      visible: false,
      next: true,
      background: true,
      running: false,
      text: '',
      speaker: false,
      spakerColor: ''
    },
    narrator: {
      visible: false,
      position: 'top',
      next: true,
      background: true,
      running: false,
      text: ''
    },
    choose: {
      visible: false,
      enabled: false,
      activeItem: false,
      selectedItem: false,
      items: [],
      event: {
        mouseenter: () => {},
        mouseleave: () => {},
        select: () => {}
      }
    },
    input: {
      visible: false,
      enabled: false,
      confirmed: false,
      event: {
        confirmInput: () => {}
      }
    }
  }
};
