
let knex = null;
const _ = require('lodash');


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

const populate = qb => {

};

const methods = (tableName, model, models) => ({
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
    const results = await knex.select().where(qb => buildWheres(qb, where)).from(tableName).on('query', function(data) {
      // console.log(data);
    });

    if (populate) {
      console.log(`populate`)
      const populateResults = await Promise.all(populate.map(async relation => {
        console.log(`relation : `, relation);
        if (model && model.associations && model.associations[relation]) {
          const relationDef = model.associations[relation];
          console.log(`relation definition :`, relationDef);
          const targetModel = models[relationDef.model] || {};
          const targetTable = targetModel.tableName || relationDef.model;
          console.log(`target table : `, targetTable);
          const targetColumn = relationDef.targetAttribute || `id`;
          const sourceColumn = relationDef.sourceAttribute || relation;
          const ids = _.map(results, sourceColumn)
          console.log(`ids : `, ids)
          const members =  await knex.select().whereIn(targetColumn, ids).from(targetTable).on('query', function(data) {
            console.log(`-->`, data.sql);
          });
          results.forEach(result => {
            if (relationDef.targetType && relationDef.targetType === `collection`) {
              const foreignObjects = _.filter(members, { [targetColumn] : result[sourceColumn]})
              console.log(`Foreign objects : `, foreignObjects);
              result[relation] = foreignObjects;
            } else {
              const foreignObject = _.find(members, { [targetColumn] : result[sourceColumn]})
              console.log(`Foreign object : `, foreignObject);
              result[relation] = foreignObject;
            }
          });
        } else {
          console.error(`no relation defined on model`);
        }
      }));

      // console.log(populateResults);
    }

    return results;
  },
  update () {

  },
  delete () {

  },
  create () {

  },
})

module.exports = knexObj => {
  knex = knexObj;
  return new Proxy({
    models : {},
  }, {
    get (obj, prop, ...args) {
      if (obj[prop]) {
        return Reflect.get(obj, prop, ...args);
      }

      const model = obj.models[prop];
      const tableName = model && model.tableName ? model.tableName : prop;
      return methods(tableName, model, obj.models);
    },
    set (obj, prop, value) {
      obj.models[prop] = value;
    },
  });
};
