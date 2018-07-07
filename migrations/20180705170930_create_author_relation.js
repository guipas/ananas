exports.up = knex => {
  return knex.schema.table('book', t => {
      t.string('author');
    });
  };

exports.down = knex => {
  return knex.schema.table('book', t => {
    t.dropColumn('author');
  });
};