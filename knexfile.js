// Update with your config settings.

module.exports = {

  tests: {
    client: 'sqlite3',
    connection: {
      filename: './testdb.sqlite3'
    },
  },

  testsPostgres: {
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'ananas',
      password : 'ananas',
      database : 'ananas',
      port : 5434,
    }
  },

};
