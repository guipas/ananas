const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const database = process.env.ANANAS_TEST_DB || `tests`;
console.log(`Using database : `, database);
// docker run --name ananas-tests -e POSTGRES_USER='ananas' -e POSTGRES_PASSWORD='ananas' -e POSTGRES_DB='ananas' -p 5434:5432 --rm postgres
// const knex = require('knex')(require(`../knexfile`).testsPostgres);
const knex = require('knex')(require(`../knexfile`)[database]);

module.exports = {
  async empty () {
    // const tableNames = await knex
    // .raw(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';`)
    // .then(res => res.rows.map(r => r.table_name).filter(t => t.indexOf(`migrations`) === -1));

    // const query = `TRUNCATE ${tableNames.map(t => `"${t}"`).join(`,`)}`;
    // return knex.raw(query);
    // return fs.remove(path.join(__dirname, `../testdb.sqlite`));
    await knex.raw(`DELETE FROM book;`);
    await knex.raw(`DELETE FROM author;`);
    await knex.raw(`DELETE FROM car;`);
    await knex.raw(`DELETE FROM drivers;`);
    await knex.raw(`DELETE FROM movie;`);
    await knex.raw(`DELETE FROM character;`);
    await knex.raw(`DELETE FROM actor;`);
    await knex.raw(`DELETE FROM fans;`);
    await knex.raw(`DELETE FROM backstory;`);
    await knex.raw(`DELETE FROM ship;`);
  },
  async loadData (data) {
    await this.empty();
    return Promise.all(Object.keys(data).map(tableName => {
      if (tableName.indexOf(`_`) === 0) {
        //do not treat private properties name like _something like table names
        return;
      }
      // return Promise.all(data[tableName].map(tableRow => knex(tableName).insert(tableRow)));
      const header = data[tableName][0];
      return Promise.all(data[tableName].map((tableRow, i) => {
        if (i > 0) {
          return knex(tableName).insert(_.zipObject(header, tableRow));
        }
      }));
    }));
  },
  knex,
}