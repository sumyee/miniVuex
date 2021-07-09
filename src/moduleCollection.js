import { forEachValue } from './util';

export default class ModuleCollection {
  constructor(options) {
    // console.log(options);
    this.register([], options);
  }

  register(path, rootModule) {
    // console.log(
    //   '🚀 ~ file: moduleCollection.js ~ line 10 ~ ModuleCollection ~ register ~ path',
    //   path
    // );

    let newModule = {
      _rawModule: rootModule,
      _children: {},
      state: rootModule.state,
    };

    // 如果 path 空数组，表示是根
    if (path.length === 0) {
      this.root = newModule;
    } else {
      // 找到父亲，把儿子放到父亲下
      const parent = path.slice(0, -1).reduce((root, curr) => {
        return root._children[curr];
      }, this.root);
      // 拿到最后一个 （就是儿子）
      parent._children[path[path.length - 1]] = newModule;
    }

    if (rootModule.modules) {
      forEachValue(rootModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule);
      });
    }
  }
}
