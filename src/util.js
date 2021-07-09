export function forEachValue(obj, callback) {
  Object.keys(obj).forEach((key) => callback(obj[key], key));
}

export function partial (fn, arg) {
  return function () {
    return fn(arg)
  }
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}