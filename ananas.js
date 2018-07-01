
let knex = null;

const methods = tableName => ({
  async findOne (...args) {
    const result = await this.find(...args).limit(1);

    return result[0];
  },
  find (options = {}) {
    const where = options;
    const wheres = [];
    Object.keys(where).forEach(attribute => {
      const value = where[attribute];
      if (typeof value === `object`) {
        if (value[`!`]) {
          const method = Array.isArray(value[`!`]) ? `whereNotIn` : `andWhereNot`;
          wheres.push([method, attribute, value[`!`]]);
          Reflect.deleteProperty(where, attribute);
        } else if (value[`>`]) {
          wheres.push([`andWhere`, attribute, `>`, value[`>`]])
          Reflect.deleteProperty(where, attribute);
        }
      }
    });

    console.log(`where : `, where);
    let query = knex.select().where(where)
    wheres.forEach(w => { query = query[w.shift()](...w)});
    return query.from(tableName).on('query', function(data) {
      console.log(data);
    });
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
    get (obj, prop) {
      return methods(prop);
    },
    set (obj, prop, value) {
      obj.models[prop] = value;
    },
  });
};
