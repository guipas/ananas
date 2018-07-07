
exports.up = function(knex) {
  return knex.schema.createTable('movie', function(table) {
    table.string('id').primary();
    table.string('title');
    table.timestamps();
  })
  .then(() => knex.schema.createTable('character', function(table) {
    table.string('id').primary();
    table.string('name');
    table.text('movie');
  }))
};

exports.down = function(knex) {
  return knex.schema.dropTable('movie')
  .then(() => knex.schema.dropTable('character'));
};
