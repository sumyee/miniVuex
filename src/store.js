import { forEachValue, partial } from './util';
import ModuleCollection from './moduleCollection';

let Vue;

class Store {
  constructor(options) {
    const state = options.state;
    // getters
    this.getters = {};
    // mutations
    this.mutations = {};
    // actions
    this.actions = {};

    // 进行响应式, state 变化会触发更新 重新获取值（eg: getters）
    this._vm = new Vue({
      data: {
        state: state,
      },
      // computed,
    });

    // 改变 this 指向
    const { commit, dispatch } = this;

    this.commit = (type, payload) => {
      commit.call(this, type, payload);
    };

    this.dispatch = (type, payload) => {
      dispatch.call(this, type, payload);
    };

    // 收集模块
    this.modules = new ModuleCollection(options);
    // console.log(
    //   '🚀 ~ file: store.js ~ line 81 ~ Store ~ constructor ~ this.modules',
    //   this.modules
    // );

    /**
     * 安装模块
     * 把 getters mutations actions 放到 this.$store 上
     */
    installModule(this, this.state, [], this.modules.root);
  }

  // 提交 mutation 的 commit 方法
  commit(type, payload) {
    this.mutations[type].forEach((fn) => {
      fn(payload);
    });
  }

  // 触发 action 的 dispatch 方法
  dispatch(type, payload) {
    this.actions[type](payload);
  }

  get state() {
    return this._vm.state;
  }
}

/**
 * 模块安装
 * @param {*} store 当前实例
 * @param {*} state 状态
 * @param {*} path 递归路径
 * @param {*} module 根module
 */
function installModule(store, state, path, module) {
  const isRoot = !path.length;

  // 如果是子模块，把子模块状态放到父模块上
  if (!isRoot) {
    const parentState = path.slice(0, -1).reduce((state, curr) => {
      return state[curr];
    }, state);
    // console.log(
    //   '🚀 ~ file: store.js ~ line 81 ~ parentState ~ parentState',
    //   parentState
    // );
    // 动态添加
    Vue.set(parentState, path[path.length - 1], module.state);
  }
  // getters
  const getters = module._rawModule.getters;
  if (getters) {
    forEachValue(getters, (fn, key) => {
      // computed[key] = partial(fn, module.state);
      Object.defineProperty(store.getters, key, {
        get: () => {
          console.log('---------------------', key);
          return fn(module.state);
        },
      });
    });
  }

  // mutations
  const mutations = module._rawModule.mutations;
  if (mutations) {
    forEachValue(mutations, (fn, key) => {
      // 用户传递过来的 mutation 放到 store 实例上
      const arr = store.mutations[key] || (store.mutations[key] = []);
      arr.push((payload) => {
        fn(module.state, payload);
      });
    });
  }

  // actions
  const actions = module._rawModule.actions;
  if (actions) {
    forEachValue(actions, (fn, key) => {
      store.actions[key] = (payload) => fn(store, payload);
    });
  }

  // 递归
  forEachValue(module._children, (childModule, key) => {
    // console.log(
    //   '🚀 ~ file: store.js ~ line 168 ~ forEachValue ~ store, state, path.concat(key), childModule',
    //   store,
    //   state,
    //   path.concat(key),
    //   childModule
    // );
    installModule(store, state, path.concat(key), childModule);
  });
}

const install = (_Vue) => {
  Vue = _Vue;

  // 每个组件注入 this.$store
  Vue.mixin({
    beforeCreate() {
      // console.log(this.$options.name, this);
      // 根组件 有传入 store
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store;
      } else {
        // 子组件可以取父组件上的 $store
        this.$store = this.$parent && this.$parent.$store;
      }
    },
  });
};

// export default {
//   Store,
//   install,
// }

export { Store, install };
