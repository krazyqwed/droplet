class StringHelper {
  splice (target, idx, rem, str) {
    return target.slice(0, idx) + str + target.slice(idx + Math.abs(rem));
  }
}

export default new StringHelper();