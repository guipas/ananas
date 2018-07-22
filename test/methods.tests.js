"use strict";

require(`./setup.js`);
const should = require('chai').should();
const db = require(`./db`);
const ananas = require('../index')(db.knex);

describe(`Methods`, function () {

  this.timeout(5000);

  it('Add models methods to entity', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      tableName : `book`,
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },

      methods : {
        addOneStar () {
          this.stars += 1;
          return this.stars;
        },
      },

    };

    const book = await ananas.book.findOne({
      title : `t1`,
    });

    should.exist(book);

    // book.should.have.property(`addOneStar`);
    book.addOneStar.should.be.a(`function`);
    book.stars.should.equal(0);
    const res = book.addOneStar();
    res.should.equal(1);
    book.stars.should.equal(1);

  });


  it('Methods should not show up in json', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      tableName : `book`,
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },

      methods : {
        addOneStar () {
          this.stars += 1;
        },
      },

    };

    const book = await ananas.book.findOne({
      title : `t1`,
    });

    should.exist(book);

    // book.should.have.property(`addOneStar`);
    book.addOneStar.should.be.a(`function`);

    const json = JSON.stringify(book);
    const parsedBook = JSON.parse(json);

    should.exist(parsedBook);
    parsedBook.should.be.an(`object`);
    should.not.exist(parsedBook.addOneStar);

  });

  it('Add models computed properties to entity', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      tableName : `book`,
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },

      computed : {
        uppercasedTitle () {
          return this.title.toUpperCase();
        },
      },

    };

    const book = await ananas.book.findOne({
      title : `t1`,
    });

    should.exist(book);

    book.uppercasedTitle.should.be.a(`string`);
    book.uppercasedTitle.should.equal(`T1`);

  });


  it('Computed should not show up in json', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      tableName : `book`,
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },

      computed : {
        uppercasedTitle () {
          return this.title.toUpperCase();
        },
      },

    };

    const book = await ananas.book.findOne({
      title : `t1`,
    });

    should.exist(book);

    const json = JSON.stringify(book);
    const parsedBook = JSON.parse(json);

    should.exist(parsedBook);
    parsedBook.should.be.an(`object`);
    should.not.exist(parsedBook.addOneStar);

  });


  it('Can use methods from computed', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      tableName : `book`,
      attributes : {
        author : String,
        title : String,
        description : String,
        stars : Number,
      },

      computed : {
        upperCasedTitle () {
          return this.upperCaseSomething(this.title);
        },
      },

      methods : {
        upperCaseSomething (str) {
          return str.toUpperCase();
        },
      },

    };

    const book = await ananas.book.findOne({
      title : `t1`,
    });

    should.exist(book);
    should.exist(book.upperCasedTitle);
    book.upperCasedTitle.should.be.a(`string`);
    book.upperCasedTitle.should.equal(`T1`);


  });

})

