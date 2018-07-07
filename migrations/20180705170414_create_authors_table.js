
exports.up = function(knex) {
  return knex.schema.createTable('author', function(table) {
    table.string('id').primary();
    table.string('name');
    table.string('bio');
    table.timestamps();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('author');
};
