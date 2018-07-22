
let knex = null;
const _ = require('lodash');
const buildWheres = require('./lib/buildWheres');
const Model = require('./lib/Model');
const proxifyResults = require('./lib/proxifyResults');

const log = (...args) => { if (false) { console.log(...args); }}
const warn = (...args) => { if (false) { console.log(...args); }}
const logQueries = false;
const queryLogger = data => logQueries && console.log(data.sql);


const methods = model => {

  return {
    async findOne (...args) {
      const result = await this.find(...args);

      return result[0];
    },

    async find (options = {}) {

      let populate = null;
      if (options.populate) {
        populate = options.populate;
        Reflect.deleteProperty(options, `populate`);
      }

      const where = options;
      const fetchedResults = await knex.select().where(qb => buildWheres(qb, where)).from(model.tableName).on('query', queryLogger);
      const parsedResults = fetchedResults.map(result => model.parseResult(result));

      if (populate) {
        // await populateResults(parsedResults, model, models, populate, knex);
        await model.populateResults(parsedResults, populate);
      }

      // return results;
      return parsedResults.map(result => proxifyResults(result, model));
    },

    async update (options, entity = null, targetModel = model) {
      let where = options;

      if (entity === null) {
        if (options === null) {
          // nothing to update
          return;
        }
        // we only passed an object to the function, so its that object that
        // we have to update based on its primary key
        entity = options;
        where = { [model.primaryKey] : entity[model.primaryKey] };
        options = {};
      }

      if (Array.isArray(entity)) {
        return Promise.all(entity.map(e => this.update(options, e, targetModel)));
      }

      // if (entity[populatedSymbol] && entity[populatedSymbol].length > 0) {

      //   // updating populated attributes
      //   await Promise.all(entity[populatedSymbol].map(relationName => {
      //     // console.log(`updating `, relationName);
      //     const relation = targetModel.associations[relationName];
      //     const relatedModel = models[relation.targetModel];
      //     // console.log(`related model : `, relatedModel);
      //     if (relation.targetType === `collection`) {
      //       return Promise.all(entity[relationName].map(subEntity => {
      //         return this.update(subEntity, null, relatedModel);
      //         // return ananas[relation.targetModel].update(subEntity);
      //       }))
      //     }

      //     return this.update(entity[relationName], null, relatedModel);

      //   }));
      // }

      // ... and removing these attribute from current entity, or taking their only their id
      // for example if we have a book model with this instance :
      // {
      //   title : `something`
      //   author : { name : `John Doe`, id : 1 } // populated
      //   tags : [ { label : `adventure`, id : 1 }, { label : `adult`, id : 2 } ] // populated
      // }
      // we want to end up with :
      // {
      //   title : `something`
      //   author : 1
      // }

      const populatedAssociationsNames = model.getPopulatedAssociations(entity);
      const populatedAttributes = model.normalizeAttributes(entity);
      entity = { ...entity, ...populatedAttributes};
      populatedAssociationsNames.forEach(pa => Reflect.deleteProperty(entity, pa));

      // console.log(`@@ end populating `, targetModel.tableName);
      // console.log(`@@ `, targetModel.attributes);
      // console.log(entity);

      if (targetModel.attributes) {
        const omitted = _.omit(entity, Object.keys(targetModel.attributes));
        if (Object.keys(omitted).length > 0) {
          warn(`Unknown attributes for model ${targetModel.name} : ${Object.keys(omitted).join(`, `)}. All attributes must be explicitly defined in models if you want them to update in your database`);
        }
        entity = _.pick(entity, Object.keys(targetModel.attributes));
        entity = _.omit(entity, [targetModel.primaryKey]);
        // entity = formatAttributes(entity, targetModel);
        entity = targetModel.formatAttributes(entity);
      }

      if (Object.keys(entity).length > 0) {
        // console.log(`upading with : `, entity);
        return knex(targetModel.tableName).where(qb => buildWheres(qb, where)).update(entity).on('query', queryLogger);
      }

      warn(`No attributes to update for model ${targetModel.name}. All attributes must be explicitly defined in models if you want them to update in your database`);
      return 0;
    },
    destroy (attributes) {
      if (Array.isArray(attributes)) {
        return Promise.all(attributes.map(attr => this.destroy(attr)));
      }
      if (Reflect.has(attributes, model.primaryKey)) {
        return knex(model.tableName).where({ [model.primaryKey] : attributes[model.primaryKey] }).del().on('query', queryLogger);
      }

      return knex(model.tableName).where(qb => buildWheres(qb, attributes)).del().on('query', queryLogger);
    },
    create (attributes) {
      return knex(model.tableName).insert(attributes).on('query', queryLogger).on('query', queryLogger);
    },
  };
};

let ananas = null;

module.exports = knexObj => {
  knex = knexObj;
  const models = {};
  const orm = { models, knex };

  ananas = new Proxy({
    models : new Proxy(models, {
      set (obj, prop, val) {
        return Reflect.set(obj, prop, new Model(prop, val, orm));
      },
    }),
  }, {
    get (obj, prop, receiver) {
      if (Reflect.has(obj, prop)) {
        return Reflect.get(obj, prop, receiver);
      }

      const model = obj.models[prop] || new Model(prop);
      return methods(model, obj.models);
    },
    set (obj, prop, value, receiver) {
      obj.models[prop] = value;
      return Reflect.set(obj, prop, value, receiver);
    },
  });

  return ananas;
};
