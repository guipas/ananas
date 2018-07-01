var knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'weview',
    password : 'weview',
    database : 'weview_prod_20180529'
  }
});

const methods = tableName => ({
  async findOne (...args) {
    const result = await this.find(...args).limit(1);

    return result[0];
  },
  find (options = {}) {
    return knex.select().where(options).from(tableName);
  },
  update () {

  },
  delete () {

  },
  create () {

  },
})


const ananas = new Proxy({
  models : {},
}, {
  get (obj, prop) {
    return methods(prop);
  },
  set (obj, prop, value) {
    obj.models[prop] = value;
  },
});

ananas.company.findOne().then(res => {
  console.log(res);
})