
exports.up = function(knex) {
  return knex.schema.createTable('car', function(table) {
    table.string('id').primary();
    table.string('model');
    table.string('description');
    table.timestamps();
  })
  .then(() => knex.schema.createTable('drivers', function(table) {
    table.string('id').primary();
    table.string('name');
    table.text('vehicule');
  }))
};

exports.down = function(knex) {
  return knex.schema.dropTable('car')
  .then(() => knex.schema.dropTable('drivers'));
};
