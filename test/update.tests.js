"use strict";

require(`./setup.js`);
const should = require('chai').should();
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');

describe(`Update`, function () {

  this.timeout(5000);

  it('Update with a simple query', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const results = await ananas.book.update({
      title : [`t2`],
    }, {
      title : `XXX`,
    });

    const books = await ananas.book.find({ title : `XXX` });

    results.should.equal(1);

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books.pop();
    should.exist(book);
    book.title.should.equal(`XXX`);

  });

  it('Update with a simple query', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const results = await ananas.book.update({
      title : [`t2`, `t3`],
    }, {
      title : `XXX`,
    });

    const books = await ananas.book.find({ title : `XXX` });

    results.should.equal(2);

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(2);
    const book = books.pop();
    should.exist(book);
    book.title.should.equal(`XXX`);

  });

  it('Update a previously fetched object without having to query', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const oldBook = await ananas.book.findOne({ title : `t2` });

    oldBook.description.should.equal(`d2`);
    oldBook.description = `YYY`;
    oldBook.description.should.equal(`YYY`);

    await ananas.book.update(oldBook);

    const book = await ananas.book.findOne({ title : `t2` });

    book.description.should.equal(`YYY`);

  });

  it('Number is casted to string on update', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const results = await ananas.book.update({
      title : [`t2`, `t3`],
    }, {
      title : 123,
    });

    const books = await ananas.book.find({ title : `123` });

    results.should.equal(2);

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(2);
    const book = books.pop();
    should.exist(book);
    book.title.should.equal(`123`);

  });

  it('Update model event if we added properties to the object', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.book = {
      attributes : {
        id : String,
        title : String,
        description : String,
      },
    };

    const book = await ananas.book.findOne({ title : `t2` });

    should.exist(book);

    book.xxx = 1;
    book.description = `yyy`;

    await ananas.book.update(book);

    const bookAfter = await ananas.book.findOne({ title : `t2` });

    bookAfter.should.be.an(`object`);
    bookAfter.title.should.equal(`t2`);
    bookAfter.description.should.equal(`yyy`);
    bookAfter.should.not.have.property(`xxx`);

  });

  it('Types stay consistents', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.ship = {
      attributes : {
        builtAt : Date,
        createdAt : Date,
        updatedAt : Date,
        departure : Date,
        active : Boolean,
        name : String,
        options : Object,
        capacity : Number,
        size : Number,
      }
    };

    const ship = await ananas.ship.findOne({ name : `ship1` });

    should.exist(ship);

    ship.createdAt = 0;
    ship.active = 1;
    ship.options = { test : `sss` };
    ship.capacity = 2.5;
    ship.capacity = 3.5;

    await ananas.ship.update(ship);

    const shipAfter = await ananas.ship.findOne({ name : `ship1` });

    const zeroDate = new Date();
    zeroDate.setTime(0);

    shipAfter.should.be.an(`object`);
    shipAfter.active.should.equal(true);
    shipAfter.options.should.be.an(`object`);
    shipAfter.options.test.should.equal(`sss`);
    shipAfter.createdAt.valueOf().should.equal(zeroDate.valueOf());

  });

  it('Strict mode does not allow to set attribute to wrong type', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.ship = {
      strict : true,
      attributes : {
        builtAt : Date,
        createdAt : Date,
        updatedAt : Date,
        departure : Date,
        active : Boolean,
        name : String,
        options : Object,
        capacity : Number,
        size : Number,
      }
    };

    const ship = await ananas.ship.findOne({ name : `ship1` });

    should.exist(ship);

    let failed = false;
    try {
      ship.createdAt = 0;
    } catch (e) {
      failed = true;
    }

    failed.should.equal(true);

  });

  it('Update populated instance correctly', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.movie = {
      associations : {
        character : {
          targetModel : `character`,
          targetType : `collection`,
          sourceAttribute : `id`,
          targetAttribute : `movie`,
        }
      },
    };

    ananas.models.character = {
    };

    const movies = await ananas.movie.find({
      title : `mo1`,
      populate : [`character`],
    });

    should.exist(movies);
    movies.should.be.an(`array`);
    movies.length.should.equal(1);
    const movie = movies.pop();
    should.exist(movie);
    movie.title.should.equal(`mo1`);
    movie.character.should.be.an(`array`);

    const cha1 = _.find(movie.character, { name : `cha1`});
    const cha2 = _.find(movie.character, { name : `cha2`});

    should.exist(cha1);
    should.exist(cha2);

    cha1.name.should.equal(`cha1`);
    cha1.movie.should.equal(movie.id);

    cha2.name.should.equal(`cha2`);
    cha2.movie.should.equal(movie.id);

    cha2.name = `cha2a`;

    ananas.movie.update(movie);

    const movieAfter = await ananas.movie.findOne({
      title : `mo1`,
      populate : [`character`],
    });


    should.exist(movieAfter);
    movieAfter.title.should.equal(`mo1`);
    movieAfter.character.should.be.an(`array`);

    const cha2a = _.find(movieAfter.character, { name : `cha2a`});

    should.exist(cha2a);

  });

  it.only('Update nested populated instances correctly', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.movie = {
      associations : {
        characters : {
          targetModel : `character`,
          targetType : `collection`,
          targetAttribute : `movie`,
          sourceAttribute : `id`,
        }
      },
    };

    ananas.models.actors = {
      tableName : `actor`,
      associations : {
        fans : {
          targetModel : `fan`,
          targetType : `collection`,
          sourceAttribute : `id`,
          targetAttribute : `id_actor`,
        },
      },
    };

    ananas.models.character = {
      associations : {
        comedian : {
          targetModel : `actors`,
          sourceAttribute : `actor_id`,
          targetAttribute : `id`,
        },
        backstory : {
          targetModel : `backstory`,
          sourceAttribute : `id`,
          targetAttribute : `character`,
        }
      }
    };

    ananas.models.fan = {
      tableName : `fans`,
    };

    const movies = await ananas.movie.find({
      title : `mo1`,
      populate : [`characters`, `characters.comedian.fans`],
    });

    should.exist(movies);
    movies.should.be.an(`array`);
    movies.length.should.equal(1);
    const movie = movies.pop();
    should.exist(movie);
    movie.title.should.equal(`mo1`);
    movie.characters.should.be.an(`array`);

    const cha1 = _.find(movie.characters, { name : `cha1`});
    const cha2 = _.find(movie.characters, { name : `cha2`});

    should.exist(cha1);
    should.exist(cha2);

    cha1.name.should.equal(`cha1`);
    cha1.comedian.should.be.an(`object`);
    cha1.comedian.name.should.equal(`act1`);

    cha2.name.should.equal(`cha2`);
    cha2.comedian.should.be.an(`object`);
    cha2.comedian.name.should.equal(`act2`);

    cha1.comedian.fans.should.be.an(`array`);
    cha2.comedian.fans.should.be.an(`array`);

    cha1.comedian.fans.length.should.equal(2);
    cha2.comedian.fans.length.should.equal(2);

    const fan1 = _.find(cha1.comedian.fans, { name : `fan1` });
    const fan2 = _.find(cha1.comedian.fans, { name : `fan2` });
    const fan3 = _.find(cha2.comedian.fans, { name : `fan3` });
    const fan4 = _.find(cha2.comedian.fans, { name : `fan4` });

    should.exist(fan1);
    should.exist(fan2);
    should.exist(fan3);
    should.exist(fan4);

    fan1.name = `fan1a`;
    fan2.name = `fan2a`;
    fan3.name = `fan3a`;
    fan4.name = `fan4a`;
    movie.title = `mo1a`;


    await ananas.movie.update(movie);

    const movieAfter = await ananas.movie.findOne({
      title : `mo1a`,
      populate : [`characters.comedian.fans`],
    });

    should.exist(movieAfter);
    movieAfter.title.should.equal(`mo1a`);
    movieAfter.characters.should.be.an(`array`);

    const cha1a = _.find(movieAfter.characters, { name : `cha1`});
    const cha2a = _.find(movieAfter.characters, { name : `cha2`});

    should.exist(cha1a);
    should.exist(cha2a);

    cha1a.name.should.equal(`cha1`);
    cha1a.comedian.should.be.an(`object`);
    cha1a.comedian.name.should.equal(`act1`);

    cha2a.name.should.equal(`cha2`);
    cha2a.comedian.should.be.an(`object`);
    cha2a.comedian.name.should.equal(`act2`);

    cha1a.comedian.fans.should.be.an(`array`);
    cha2a.comedian.fans.should.be.an(`array`);

    cha1a.comedian.fans.length.should.equal(2);
    cha2a.comedian.fans.length.should.equal(2);

    const fan1a = _.find(cha1.comedian.fans, { name : `fan1a` });
    const fan2a = _.find(cha1.comedian.fans, { name : `fan2a` });
    const fan3a = _.find(cha2.comedian.fans, { name : `fan3a` });
    const fan4a = _.find(cha2.comedian.fans, { name : `fan4a` });

    should.exist(fan1a);
    should.exist(fan2a);
    should.exist(fan3a);
    should.exist(fan4a);



  });



});

