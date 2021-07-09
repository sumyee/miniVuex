import { isObject } from './util';

export const mapState = function (states) {
  const res = {};
  normalizeMap(states).forEach(({ key, val }) => {    
    res[key] = function () {
      const state = this.$store.state;
      const getters = this.$store.getters;
      return typeof val === 'function'
        ? val.apply(this, state, getters)
        : state[val];
    };
  });

  return res;
};

export const mapGetter = function (getters) {
  const res = {};
  normalizeMap(getters).forEach(({ key, val }) => {    
    res[key] = function () {
      return this.$store.getters[val]
    };
  });

  return res;
}

function normalizeMap(map) {
  if (!(Array.isArray(map) || isObject(map))) {
    return [];
  }
  return Array.isArray(map)
    ? map.map((key) => ({ key, val: key }))
    : Object.keys(map).map((key) => ({ key, val: map[key] }));
}
