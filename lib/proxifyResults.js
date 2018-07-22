const casters = require('./casters');

module.exports = function proxifyResults (results, model) {

  const proxy = new Proxy(results, {
    set (obj, prop, val, receiver) {
      if (model.attributes && Reflect.has(model.attributes, prop)) {
        const caster = casters[model.attributes[prop]];
        if (model.strict && !caster.validate(val)) {
          throw new Error(`Wrong type for attribute ${prop} (${typeof prop}).`);
        }
      }
      return Reflect.set(obj, prop, val, receiver);
    },
    get (obj, prop, receiver) {
      if (prop === `toJSON`) {
        return JSON.stringify(obj);
      }

      if (Reflect.has(obj, prop)) {
        return Reflect.get(obj, prop, receiver);
      }

      if (model.methods && Reflect.has(model.methods, prop)) {
        return (...args) => Reflect.apply(model.methods[prop], receiver, args);
      }

      if (model.computed && Reflect.has(model.computed, prop)) {
        return Reflect.apply(model.computed[prop], receiver, []);
      }

      return Reflect.get(obj, prop, receiver);
    },
  });

  return proxy;
};