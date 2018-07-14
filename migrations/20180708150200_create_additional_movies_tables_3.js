
exports.up = function(knex) {
  return knex.schema.createTable('backstory', function(table) {
    table.string('id').primary();
    table.string('content');
    table.string('character');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('backstory');
};
