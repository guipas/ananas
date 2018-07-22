"use strict";

require(`./setup.js`);
// const assert = require('chai').assert;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../index')(db.knex);
const _ = require('lodash');

describe(`Association : hasMany`, function () {

  this.timeout(5000);

  it('Load an entity with a simple hasOne relationship', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.magazine = {
      attributes : {
        author : String,
      },
      tableName : `book`,
      associations : {
        author : {
          targetModel : `author`,
          sourceAttribute : `author`,
          targetAttribute : `id`,
        }
      },
    };

    ananas.models.author = {
      associations : {
        books : {
          targetModel : `magazine`,
          sourceAttribute : `id`,
          targetAttribute : `author`,
          targetType : `collection`,
        },
      },
    };

    const authors = await ananas.author.find({
      name : `n2`,
      populate : [`books`],
    });

    should.exist(authors);
    authors.should.be.an(`array`);
    authors.length.should.equal(1);
    const author = authors.pop();
    should.exist(author);
    author.name.should.equal(`n2`);
    author.books.should.be.an(`array`);
    author.books.length.should.equal(2);

    const book1 = _.find(author.books, { title : `t2` });
    const book2 = _.find(author.books, { title : `t3` });

    should.exist(book1);
    should.exist(book2);


  });

  it('Can be defined with a helper function', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.magazine = {
      attributes : {
        author : String,
      },
      tableName : `book`,
      associations : {
        author : {
          targetModel : `author`,
          sourceAttribute : `author`,
          targetAttribute : `id`,
        }
      },
    };

    ananas.models.author = {
      associations : {
        books () {
          return this.hasMany(`magazine`, `author`, `id`);
        },
      },
    };

    const authors = await ananas.author.find({
      name : `n2`,
      populate : [`books`],
    });

    should.exist(authors);
    authors.should.be.an(`array`);
    authors.length.should.equal(1);
    const author = authors.pop();
    should.exist(author);
    author.name.should.equal(`n2`);
    author.books.should.be.an(`array`);
    author.books.length.should.equal(2);

    const book1 = _.find(author.books, { title : `t2` });
    const book2 = _.find(author.books, { title : `t3` });

    should.exist(book1);
    should.exist(book2);


  });

})

