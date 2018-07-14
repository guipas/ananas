
let knex = null;
const _ = require('lodash');

const log = (...args) => { if (false) { console.log(...args); }}
const logQueries = false;
const queryLogger = data => logQueries && console.log(data.sql);

const buildWheres = (qb, whereArgs, parentAttribute) => {

  Object.keys(whereArgs).forEach(attribute => {
    const value = whereArgs[attribute];
    switch (attribute) {

      case `or`:
        value.forEach(v => {
          qb = qb.orWhere(subQb => buildWheres(subQb, v));
        });
        break;

      case `!`:
        if (Array.isArray(value)) {
          qb = qb.whereNotIn(parentAttribute, value);
        } else {
          qb = qb.whereNot(parentAttribute, value);
        }
        break;

      case `<`   :
      case `>`   :
      case `<=`  :
      case `>=`  :
      case `=`   :
      case `like`:
        qb = qb.andWhere(parentAttribute, attribute, value);
        break;

      default:
        if (Array.isArray(value)) {
          qb = qb.whereIn(attribute, value);
        } else if (typeof value === `object`) {
          qb = qb.andWhere(subQb => buildWheres(subQb, value, attribute));
        } else {
          qb = qb.andWhere(attribute, `=`, value);
        }
    }
  })
};

const populatedSymbol = Symbol(`populated`);
const populateResults = async (results, model, models, relationsList) => {
  log(`populating results`);
  const relationsTree = Array.isArray(relationsList) ? _.zipObjectDeep(relationsList, relationsList) : relationsList;
  log(`zip : `, relationsTree);

  await Promise.all(Object.keys(relationsTree).map(async relation => {
    log(`relation : `, relation);

    if (model && model.associations && model.associations[relation]) {

      const relationDef = model.associations[relation];
      log(`relation definition :`, relationDef);
      const targetModel = models[relationDef.targetModel] || {};
      const targetTable = targetModel.tableName || relationDef.targetModel;
      log(`target table : `, targetTable);
      // const targetColumn = relationDef.targetAttribute;
      log(`target column : `, relationDef.targetAttribute);
      // const sourceColumn = relationDef.sourceAttribute;
      log(`source column : `, relationDef.sourceAttribute);
      const ids = _.map(results, relationDef.sourceAttribute);
      log(`ids : `, ids)
      const populationResults =  await knex.select().whereIn(relationDef.targetAttribute, ids).from(targetTable).on('query', queryLogger);
      log(`${populationResults.length} results`);
      results.forEach(result => {
        const method = relationDef.targetType && relationDef.targetType === `collection` ? `filter` : `find`;
        const foreignObjects = _[method](populationResults, { [relationDef.targetAttribute] : result[relationDef.sourceAttribute]})
        log(`Foreign objects : `, foreignObjects);
        result[relation] = foreignObjects;

        if (Array.isArray(result[populatedSymbol])) {
          result[populatedSymbol].push(relation);
        } else {
          result[populatedSymbol] = [relation];
        }
      });

      if (typeof relationsTree[relation] === `object`) {
        log(`- populate sub-relations`);
        const subTree = relationsTree[relation]
        log(`- subTree : `, subTree);
        await populateResults(populationResults, targetModel, models, subTree);

      }
    } else {
      log(`no relation defined on model`);
    }

  }));

  // console.log(populateResults);
};

const casters = {
  [Object] : {
    parse : val => typeof val === `object` ? val : JSON.parse(val),
    validate : val => typeof val === `object`,
    format : JSON.stringify,
  },
  [String] : {
    parse : _.toString,
    validate : _.isString,
    format : _.toString,
  },
  [Number] : {
    parse : _.toNumber,
    format : _.toNumber,
    validate : _.isNumber,
  },
  [Date] : {
    parse : val => _.isDate(val) ? val : new Date(val),
    format : val => val.toISOString && val.toISOString() || val,
    validate : _.isDate,
  },
  [Boolean] : {
    parse : val => val && true,
    format : val => val && true,
    validate : _.isBoolean,
  },

};

const parseResult = (results, model) => {
  const castedResults = {};
  Object.keys(results).forEach(attributeName => {
    if (model.attributes && model.attributes[attributeName]) {
      const attributeType = model.attributes[attributeName];
      if (typeof attributeType === `function`) {
        // console.log()
        castedResults[attributeName] = casters[attributeType].parse(results[attributeName])
        return;
      }
    }

    castedResults[attributeName] = results[attributeName];
  });

  return castedResults;
};

const formatAttributes = (attributes, model) => {
  const formatedAttributes = {};
  Object.keys(attributes).forEach(attributeName => {
    const attributeType = model.attributes[attributeName];
    if (model.attributes && attributeType) {
      formatedAttributes[attributeName] = casters[attributeType].format(attributes[attributeName]);
      return;
    }

    formatedAttributes[attributeName] = attributes[attributeName];
  });

  return formatedAttributes;
};

const proxifyResults = (results, model) => {
  return new Proxy(results, {
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

      return Reflect.get(obj, prop, receiver);
    },
  });
};

const initModel = modelName => ({
  tableName : modelName,
  primaryKey : `id`,
  strict : false,
});

const methods = (modelName, models) => {
  const model = { ...initModel(modelName), ...models[modelName] };
  Object.keys(models).forEach(m => {
    models[m] = {
      ...initModel(m),
      ...models[m],
    };
  });

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
      const parsedResults = fetchedResults.map(result => parseResult(result, model));

      if (populate) {
        await populateResults(parsedResults, model, models, populate);
      }

      // return results;
      return parsedResults.map(result => proxifyResults(result, model));
    },

    async update (options, entity = null, targetModel = model) {
      console.log(`---> enter update`, targetModel.tableName);
      let where = options;

      if (entity === null) {
        // we only passed an object to the function, so its that object that
        // we have to update based on its primary key
        entity = options;
        where = { [model.primaryKey] : entity[model.primaryKey] };
        options = {};
      }

      if (entity[populatedSymbol] && entity[populatedSymbol].length > 0) {

        // updating populated attributes
        await Promise.all(entity[populatedSymbol].map(relationName => {
          console.log(`updating `, relationName);
          const relation = targetModel.associations[relationName];
          const relatedModel = models[relation.targetModel];
          // console.log(`related model : `, relatedModel);
          if (relation.targetType === `collection`) {
            return Promise.all(entity[relationName].map(subEntity => {
              return this.update(subEntity, null, relatedModel);
              // return ananas[relation.targetModel].update(subEntity);
            }))
          }

          return this.update(entity[relationName], null, relatedModel);

        }));

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
        //
        const populatedAttributes = {};
        const pureAssociations = [];
        entity[populatedSymbol].forEach(relationName => {
          console.log(`##`, targetModel.tableName, `has populated : `, relationName);
          if (targetModel.attributes && targetModel.attributes[relationName]) {
            const relation = targetModel.associations[relationName];
            populatedAttributes[relationName] = entity[relationName][relation.targetAttribute];
          } else {
            pureAssociations.push(relationName);
          }
        });
        console.log(`populated attr : `, populatedAttributes);
        entity = { ...entity, ...populatedAttributes};
        pureAssociations.forEach(pa => Reflect.deleteProperty(entity, pa));
      }

      console.log(`@@ end populating `, targetModel.tableName);
      console.log(`@@ `, targetModel.attributes);

      if (targetModel.attributes) {
        entity = _.pick(entity, Object.keys(targetModel.attributes));
        entity = formatAttributes(entity, targetModel);
      }

      const res = await knex(targetModel.tableName).where(qb => buildWheres(qb, where)).update(entity).on('query', queryLogger);
      console.log(`<---- leaving upate`, targetModel.tableName);
      return res;
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
  ananas = new Proxy({
    models : {},
  }, {
    get (obj, prop, ...args) {
      if (obj[prop]) {
        return Reflect.get(obj, prop, ...args);
      }

      return methods(prop, obj.models);
    },
    set (obj, prop, value, ...args) {
      obj.models[prop] = value;
      return true;
    },
  });

  return ananas;
};
