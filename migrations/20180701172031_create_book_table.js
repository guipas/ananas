
exports.up = function(knex) {
  return knex.schema.createTable('book', function(table) {
    table.string('id').primary();
    table.string('title');
    table.string('description');
    table.integer('stars');
    // table.timestamps();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('book');
};
