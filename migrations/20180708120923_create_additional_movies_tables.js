
exports.up = function(knex) {
  return knex.schema.createTable('actor', function(table) {
    table.string('id').primary();
    table.string('name');
  }).then(() => knex.schema.table('character', t => {
    t.string('actor_id');
  }))
};

exports.down = function(knex) {
  return knex.schema.dropTable('actor')
  .then(() => knex.schema.table('book', t => {
    t.dropColumn('actor_id');
  }));
};
