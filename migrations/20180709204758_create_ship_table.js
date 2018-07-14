
exports.up = function(knex) {
  return knex.schema.createTable('ship', function(table) {
    table.string('id').primary();
    table.text('name');
    table.json('options');
    table.integer('capacity');
    table.float('size');
    table.date('builtAt');
    table.dateTime('createdAt');
    table.time('updatedAt');
    table.timestamp('departure');
    table.boolean('active');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('ship');
};
