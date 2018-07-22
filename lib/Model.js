const _ = require('lodash');
const casters = require('./casters');

const log = (...args) => { if (false) { console.log(...args); }}
const warn = (...args) => { if (false) { console.log(...args); }}
const logQueries = false;
const queryLogger = data => logQueries && console.log(data.sql);

function Model (name, options = {}, orm) {
  this.orm = orm;
  this.name = name;
  this.tableName = options.tableName || name;
  this.primaryKey = options.primaryKey || `id`;
  this.strict = options.strict && true;
  this.attributes = options.attributes || {};
  this.associations = {};
  this.methods = options.methods || {};
  this.computed = options.computed || {};

  if (!this.attributes[this.primaryKey]) {
    this.attributes[this.primaryKey] = String;
  }

  if (options.associations) {
    Object.keys(options.associations).forEach(associationName => {
      let associationOptions = options.associations[associationName];

      if (typeof associationOptions === `function`) {
        const fn = associationOptions;
        associationOptions = Reflect.apply(fn, {
          hasOne (targetModel, targetAttribute, sourceAttribute) {
            return { targetModel, targetAttribute, sourceAttribute };
          },
          hasMany (targetModel, targetAttribute, sourceAttribute) {
            return { targetModel, targetAttribute, sourceAttribute, targetType : `collection` };
          },
          belongsTo (targetModel, sourceAttribute, targetAttribute) {
            return { targetModel, targetAttribute, sourceAttribute };
          },
        }, []);
      }

      if (!this.attributes[associationOptions.sourceAttribute]) {
        throw new Error(`Source attribute for an association should defined in model's attributes`);
      }

      this.associations[associationName] = associationOptions;
    });
  }
}

Model.prototype.getPopulatedAttributes = function (entity) {
  const attributes = _.pick(entity, Object.keys(this.attributes));

  const populatedAttributes = Object.keys(attributes).filter(attributeName => {
    const attributeType = this.attributes[attributeName];
    const caster = casters[attributeType];
    const association = this.associations[attributeName];
    return (entity[attributeName] && !caster.validate(entity[attributeName]) && association && !_.isNil(entity[attributeName][association.targetAttribute]));
  });

  // console.log(`populated attributes : `, populatedAttributes);
  return populatedAttributes;
};

Model.prototype.getPopulatedAssociations = function (entity) {
  let associationsProps = _.pick(entity, Object.keys(this.associations));
  associationsProps = _.omit(associationsProps, Object.keys(this.attributes));

  const populatedAssociations = Object.keys(associationsProps).filter(associationName => {
    const propValue = associationsProps[associationName];
    const association = this.associations[associationName];
    return propValue && association && !_.isNil(propValue[association.targetAttribute]);
  });

  // console.log(`populated associations : `, populatedAssociations);
  return populatedAssociations;
}

Model.prototype.normalizeAttributes = function (entity) {
  const populatedAttributesNames = this.getPopulatedAttributes(entity);
  const attributes = _.pick(entity, Object.keys(this.attributes));

  populatedAttributesNames.forEach(attributeName => {
    const association = this.associations[attributeName];
    attributes[attributeName] = attributes[attributeName][association.targetAttribute];
  });

  // console.log(`nomalized attributes : `, attributes);

  return attributes;
};

Model.prototype.populateResults = async function (results, relationsList, model = this) {
  log(`populating results`);
  const relationsTree = Array.isArray(relationsList) ? _.zipObjectDeep(relationsList, relationsList) : relationsList;
  log(`zip : `, relationsTree);

  await Promise.all(Object.keys(relationsTree).map(async relation => {
    log(`relation : `, relation);

    if (model && model.associations && model.associations[relation]) {

      const relationDef = model.associations[relation];
      log(`relation definition :`, relationDef);
      const targetModel = this.orm.models[relationDef.targetModel] || {};
      const targetTable = targetModel.tableName || relationDef.targetModel;
      log(`target table : `, targetTable);
      // const targetColumn = relationDef.targetAttribute;
      log(`target column : `, relationDef.targetAttribute);
      // const sourceColumn = relationDef.sourceAttribute;
      log(`source column : `, relationDef.sourceAttribute);
      const ids = _.map(results, relationDef.sourceAttribute);
      log(`ids : `, ids)
      const populationResults =  await this.orm.knex.select().whereIn(relationDef.targetAttribute, ids).from(targetTable).on('query', queryLogger);
      log(`${populationResults.length} results`);
      results.forEach(result => {
        const method = relationDef.targetType && relationDef.targetType === `collection` ? `filter` : `find`;
        const foreignObjects = _[method](populationResults, { [relationDef.targetAttribute] : result[relationDef.sourceAttribute]})
        log(`Foreign objects : `, foreignObjects);
        result[relation] = foreignObjects || null;

        // if (Array.isArray(result[populatedSymbol])) {
        //   result[populatedSymbol].push(relation);
        // } else {
        //   result[populatedSymbol] = [relation];
        // }
      });

      if (typeof relationsTree[relation] === `object`) {
        log(`- populate sub-relations`);
        const subTree = relationsTree[relation]
        log(`- subTree : `, subTree);
        await this.populateResults(populationResults, subTree, targetModel);

      }
    } else {
      log(`no relation defined on model`);
    }

  }));

  // console.log(populateResults);
}

Model.prototype.formatAttributes = function (attributes) {
  const formatedAttributes = {};
  Object.keys(attributes).forEach(attributeName => {
    const attributeType = this.attributes[attributeName];
    if (this.attributes && attributeType) {
      formatedAttributes[attributeName] = casters[attributeType].format(attributes[attributeName]);
      return;
    }

    formatedAttributes[attributeName] = attributes[attributeName];
  });

  return formatedAttributes;
};

Model.prototype.parseResult = function (results) {
  const castedResults = {};
  Object.keys(results).forEach(attributeName => {
    if (this.attributes && this.attributes[attributeName]) {
      const attributeType = this.attributes[attributeName];
      if (typeof attributeType === `function`) {
        // console.log()
        castedResults[attributeName] = casters[attributeType].parse(results[attributeName])
        return;
      }
    }

    castedResults[attributeName] = results[attributeName];
  });

  return castedResults;
}

module.exports = Model;
