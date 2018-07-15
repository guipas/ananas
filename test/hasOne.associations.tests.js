"use strict";

require(`./setup.js`);
// const assert = require('chai').assert;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');

describe(`Association : hasOne`, function () {

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
        book : {
          targetModel : `magazine`,
          sourceAttribute : `id`,
          targetAttribute : `author`,
        },
      },
    };

    const authors = await ananas.author.find({
      name : `n1`,
      populate : [`book`],
    });

    should.exist(authors);
    authors.should.be.an(`array`);
    authors.length.should.equal(1);
    const author = authors.pop();
    should.exist(author);
    author.name.should.equal(`n1`);
    author.book.should.be.an(`object`);
    author.book.title.should.equal(`t1`);

  });

})

