class StringHelper {
  splice(target, idx, rem, str) {
    return target.slice(0, idx) + str + target.slice(idx + Math.abs(rem));
  }

  hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].join(',') : null;
  }

  extractFilename(path) {
    let x = path.lastIndexOf('/');

    if (x >= 0) {
      path = path.substr(x + 1);
    }

    x = path.lastIndexOf('\\');

    if (x >= 0) {
      path = path.substr(x + 1);
    }

    let filename = path.split('.');
    filename.pop();

    return filename[0];
  }
}

export default new StringHelper();