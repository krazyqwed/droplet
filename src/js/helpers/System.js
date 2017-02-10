class SystemHelper {
  isElectron() {
    return window && window.process && window.process.type;
  }
}

export default new SystemHelper();