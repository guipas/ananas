"use strict";

require(`./setup.js`);
// const assert = require('chai').assert;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');

describe('Find queries', function() {

  it('find all results for find() query', async function () {

    const data = require('./fixtures/simple.fixture');

    await db.loadData(data);

    const books = await ananas.book.find();

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(5);
  });

  it('find one result for findOne() query', async function () {

    const data = require('./fixtures/simple.fixture');

    await db.loadData(data);

    const book = await ananas.book.findOne();

    should.exist(book);
    book.should.be.an(`object`);
    book.should.have.property(`id`);
    book.should.have.property(`title`);
    book.should.have.property(`description`);

  });

  it('find one correct result for findOne() query on first book', async function () {

    const data = require('./fixtures/simple.fixture');

    await db.loadData(data);

    const bookId = data.book[1][0];

    const book = await ananas.book.findOne({ id : bookId });

    should.exist(book);
    book.should.be.an(`object`);
    book.should.have.property(`id`);
    book.should.have.property(`title`);
    book.should.have.property(`description`);
    book.title.should.equal(`t1`);
    book.description.should.equal(`d1`);
    Object.keys(book).length.should.equal(5);
  });

  it('find one correct result for find() query on first book', async function () {

    const data = require('./fixtures/simple.fixture');

    await db.loadData(data);

    const bookId = data.book[1][0];

    const books = await ananas.book.find({ id : bookId });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);

    const book = books[0];

    should.exist(book);
    book.should.be.an(`object`);
    book.should.have.property(`id`);
    book.should.have.property(`title`);
    book.should.have.property(`description`);
    book.title.should.equal(`t1`);
    book.description.should.equal(`d1`);
    Object.keys(book).length.should.equal(5);

  });

  it('find all results if several matches', async function () {

    const data = require('./fixtures/simple.fixture');

    await db.loadData(data);

    const books = await ananas.book.find({ stars : 3 });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(2);

    books.forEach(book => {
      book.stars.should.equal(3);
    })

  });

  it('greater than works', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({ stars : { '>' : 2 } });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(2);

    books[0].stars.should.be.greaterThan(2);
    books[1].stars.should.be.greaterThan(2);
  });

  it('not value works', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({ stars : { '!' : 2 } });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(4);

    books[0].stars.should.not.equal(2);
    books[1].stars.should.not.equal(2);
    books[2].stars.should.not.equal(2);
    books[3].stars.should.not.equal(2);
  });

  it('value not in works', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({ stars : { '!' : [0, 1] } });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(3);

    books[0].stars.should.be.greaterThan(1);
    books[1].stars.should.be.greaterThan(1);
    books[2].stars.should.be.greaterThan(1);
  });

  it('combining where and where not in', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({ stars : { '!' : [0, 1] } , title : `t3` });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);

    books[0].stars.should.equal(2);
  });

  it('or predicate', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({
      or : [
        { title : `t1` },
        { stars : 1 },
      ],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(2);

  });

  it('or predicate with in', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({
      or : [
        { title : [`t2`, `t3`] },
        { stars : 0 },
      ],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(3);

  });

  it('or predicate with multiple sub-criteria', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({
      or : [
        {
          title : [`t2`, `t3`],
          stars : 2,
        },
        { stars : 0 },
      ],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(2);

  });

  it('or predicate with "in" and "not"', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({
      or : [
        {
          title : [`t4`, `t5`],
          stars : { '!' : 3 },
        },
        { stars : 0 },
      ],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books.pop();

    should.exist(book);
    book.title.should.equal(`t1`);

  });

  it('or predicate with "in" and "not in"', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({
      or : [
        {
          title : [`t2`, `t3`],
          stars : { '!' : [1, 2] },
        },
        { stars : 0 },
      ],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books.pop();

    should.exist(book);
    book.title.should.equal(`t1`);

  });

  it('or predicate with "in" and "not in" that cancel each others', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const books = await ananas.book.find({
      or : [
        {
          title : [`t2`, `t3`],
          stars : { '!' : [1, 2] },
        },
      ],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(0);
    const book = books.pop();
    should.not.exist(book);

  });

});
