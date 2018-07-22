"use strict";

require(`./setup.js`);
const expect = require('chai').expect;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../index')(db.knex);
const _ = require('lodash');

describe(`Association : belongsTo`, function () {

  this.timeout(5000);

  it('Load an entity with a simple belongsTo relationship', async function () {

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

    const books = await ananas.magazine.find({
      title : `t2`,
      populate : [`author`],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books.pop();
    should.exist(book);
    book.title.should.equal(`t2`);
    book.author.should.be.an(`object`);
    book.author.name.should.equal(`n2`);

  });

  it('Can be defined with helper function', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.magazine = {
      attributes : {
        author : String,
      },
      tableName : `book`,
      associations : {
        author () {
          return this.belongsTo(`author`, `author`, `id`)
        },
      },

    };

    const books = await ananas.magazine.find({
      title : `t2`,
      populate : [`author`],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books.pop();
    should.exist(book);
    book.title.should.equal(`t2`);
    book.author.should.be.an(`object`);
    book.author.name.should.equal(`n2`);

  });


  it('Does not modify populated attributes', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },
      tableName : `book`,
      associations : {
        author : {
          targetModel : `writer`,
          sourceAttribute : `author`,
          targetAttribute : `id`,
        }
      },
    };

    ananas.models.writer = {
      tableName : `author`,
      attributes : {
        name : String,
        bio : String,
      }
    };

    const books = await ananas.book.find({
      title : `t2`,
      populate : [`author`],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books[0];
    should.exist(book);
    book.title.should.equal(`t2`);
    book.author.should.be.an(`object`);
    book.author.name.should.equal(`n2`);

    book.description = `xxx`;
    book.author.name = `n2a`;

    await ananas.book.update(books);

    const bookAfter = await ananas.book.findOne({ title : `t2`, populate : [`author`] });

    should.exist(bookAfter);
    bookAfter.description.should.equal(`xxx`);
    bookAfter.author.name.should.equal(`n2`);

  });

  // it('Update populated attribute correctly', async function () {

  //   const data = require('./fixtures/simple.fixture');
  //   await db.loadData(data);

  //   ananas.models.book = {
  //     attributes : {
  //       author : String,
  //       title : String,
  //       description : String,
  //       stars : Number,
  //     },
  //     tableName : `book`,
  //     associations : {
  //       author : {
  //         targetModel : `writer`,
  //         sourceAttribute : `author`,
  //         targetAttribute : `id`,
  //       }
  //     },
  //   };

  //   ananas.models.writer = {
  //     tableName : `author`,
  //     attributes : {
  //       name : String,
  //       bio : String,
  //     }
  //   };

  //   const books = await ananas.book.find({
  //     title : `t2`,
  //     populate : [`author`],
  //   });

  //   should.exist(books);
  //   books.should.be.an(`array`);
  //   books.length.should.equal(1);
  //   const book = books[0];
  //   should.exist(book);
  //   book.title.should.equal(`t2`);
  //   book.author.should.be.an(`object`);
  //   book.author.name.should.equal(`n2`);

  //   book.description = `xxx`;
  //   book.author.name = `n2a`;

  //   await ananas.book.update(books);

  //   const bookAfter = await ananas.book.findOne({ title : `t2`, populate : [`author`] });

  //   should.exist(bookAfter);
  //   bookAfter.description.should.equal(`xxx`);
  //   bookAfter.author.name.should.equal(`n2a`);

  // });

  it('Replace populated attribute correctly', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },
      tableName : `book`,
      associations : {
        author : {
          targetModel : `writer`,
          sourceAttribute : `author`,
          targetAttribute : `id`,
        }
      },
    };

    ananas.models.writer = {
      tableName : `author`,
      attributes : {
        name : String,
        bio : String,
      }
    };

    const books = await ananas.book.find({
      title : `t2`,
      populate : [`author`],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books[0];
    should.exist(book);
    book.title.should.equal(`t2`);
    book.author.should.be.an(`object`);
    book.author.name.should.equal(`n2`);

    const author = await ananas.author.findOne({ name : `n5` })

    book.description = `xxx`;
    book.author = author;

    await ananas.book.update(books);

    const bookAfter = await ananas.book.findOne({ title : `t2`, populate : [`author`] });

    should.exist(bookAfter);
    bookAfter.description.should.equal(`xxx`);
    bookAfter.author.name.should.equal(`n5`);

  });

  it('Delete populated attribute correctly', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },
      tableName : `book`,
      associations : {
        author : {
          targetModel : `writer`,
          sourceAttribute : `author`,
          targetAttribute : `id`,
        }
      },
    };

    ananas.models.writer = {
      tableName : `author`,
      attributes : {
        name : String,
        bio : String,
      }
    };

    const books = await ananas.book.find({
      title : `t2`,
      populate : [`author`],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books[0];
    should.exist(book);
    book.title.should.equal(`t2`);
    book.author.should.be.an(`object`);
    book.author.name.should.equal(`n2`);

    book.description = `xxx`;
    book.author = null

    await ananas.book.update(books);

    const bookAfter = await ananas.book.findOne({ title : `t2`, populate : [`author`] });

    should.exist(bookAfter);
    bookAfter.description.should.equal(`xxx`);
    expect(bookAfter.author).to.equal(null);
    // bookAfter.author.should.equal(null);

  });

  // it('Unpopulated association replacement', async function () {

  //   const data = require('./fixtures/simple.fixture');
  //   await db.loadData(data);

  //   ananas.models.book = {
  //     attributes : {
  //       author : String,
  //       title : String,
  //       description : String,
  //       stars : Number,
  //     },
  //     tableName : `book`,
  //     associations : {
  //       author : {
  //         targetModel : `writer`,
  //         sourceAttribute : `author`,
  //         targetAttribute : `id`,
  //       }
  //     },
  //   };

  //   ananas.models.writer = {
  //     tableName : `author`,
  //     attributes : {
  //       name : String,
  //       bio : String,
  //     }
  //   };

  //   const book = await ananas.book.findOne({
  //     title : `t2`,
  //   });

  //   should.exist(book);
  //   book.author.should.be.a(`string`);

  //   const author = await ananas.author.findOne({ id : `n5` })

  //   book.author = author;
  // });


})

