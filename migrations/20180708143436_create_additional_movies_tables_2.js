
exports.up = function(knex) {
  return knex.schema.createTable('fans', function(table) {
    table.string('id').primary();
    table.string('name');
    table.string('id_actor');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('fans');
};
