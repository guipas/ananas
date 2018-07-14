"use strict";

require(`./setup.js`);
// const assert = require('chai').assert;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');

describe(`Models`, function () {

  this.timeout(5000);

  it('Load a model with a custom table name', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.magazine = {
      tableName : `book`,
    };

    const books = await ananas.magazine.find({
      title : [`t2`],
    });

    should.exist(books);
    books.should.be.an(`array`);
    books.length.should.equal(1);
    const book = books.pop();
    should.exist(book);
    book.title.should.equal(`t2`);

  });

  it('Load a model with a simple 1:1 relationship', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.magazine = {
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


  it('Load a model with a custom 1:1 relationship', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.magazine = {
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

  it('Load a model with a custom 1:1 relationship with different source and dest attributes', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.driver = {
      tableName : `drivers`,
      associations : {
        car : {
          targetModel : `car`,
          sourceAttribute : `vehicule`,
          targetAttribute : `model`,
        }
      },
    };

    const drivers = await ananas.driver.find({
      name : `n1`,
      populate : [`car`],
    });

    should.exist(drivers);
    drivers.should.be.an(`array`);
    drivers.length.should.equal(1);
    const driver = drivers.pop();
    should.exist(driver);
    driver.name.should.equal(`n1`);
    driver.car.should.be.an(`object`);
    driver.car.model.should.equal(`m1`);
    driver.car.description.should.equal(`cd1`);

  });

  it('Load a model with a custom 1:1 relationship with different source and dest attributes', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.driver = {
      tableName : `drivers`,
      associations : {
        car : {
          targetModel : `car`,
          sourceAttribute : `vehicule`,
          targetAttribute : `model`,
        }
      },
    };

    ananas.models.car = {
      associations : {
        theDriver : {
          targetModel : `driver`,
          sourceAttribute : `model`,
          targetAttribute : `vehicule`,
        }
      }
    };

    const cars = await ananas.car.find({
      model : [`m1`, `m2`],
      populate : [`theDriver`],
    });

    should.exist(cars);
    cars.should.be.an(`array`);
    cars.length.should.equal(2);
    const car1 = _.find(cars, { model : `m1` });
    const car2 = _.find(cars, { model : `m2` });
    should.exist(car1);
    should.exist(car2);
    car1.model.should.equal(`m1`);
    car1.theDriver.should.be.an(`object`);
    car1.theDriver.name.should.equal(`n1`);
    car1.theDriver.vehicule.should.equal(`m1`);

  });


  it('Load a model with a simple 1:n relationship', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.movie = {
      associations : {
        characters : {
          targetModel : `character`,
          sourceAttribute : `id`,
          targetAttribute : `movie`,
          targetType : `collection`,
        }
      },
    };

    ananas.models.character = {
    };

    const movies = await ananas.movie.find({
      title : `mo1`,
      populate : [`characters`],
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
    cha1.movie.should.equal(movie.id);

    cha2.name.should.equal(`cha2`);
    cha2.movie.should.equal(movie.id);

  });

  it('Load a model with a 1:n relationship without a explcit dest model', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.character = {
      associations : {
        movie : {
          targetModel : `movie`,
          targetAttribute : `id`,
          sourceAttribute : `movie`,
        }
      }
    };

    const chars = await ananas.character.find({
      name : `cha1`,
      populate : [`movie`],
    });

    should.exist(chars);
    chars.should.be.an(`array`);
    chars.length.should.equal(1);
    const cha1 = chars.pop();
    should.exist(cha1);
    cha1.name.should.equal(`cha1`);
    cha1.movie.should.be.an(`object`);
    cha1.movie.title.should.equal(`mo1`);

  });

  it('Load a model with a 1:n relationship with an empty dest model', async function () {

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

  });


  it('Load a model with a nested relationship', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.movie = {
      associations : {
        characters : {
          targetModel : `character`,
          targetType : `collection`,
          sourceAttribute : `id`,
          targetAttribute : `movie`,
        }
      },
    };

    ananas.models.actors = {
      tableName : `actor`,
    };

    ananas.models.character = {
      associations : {
        comedian : {
          targetModel : `actors`,
          sourceAttribute : `actor_id`,
          targetAttribute : `id`,
        }
      }
    };

    const movies = await ananas.movie.find({
      title : `mo1`,
      populate : [`characters`, `characters.comedian`],
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
    cha1.movie.should.equal(movie.id);
    cha1.comedian.should.be.an(`object`);
    cha1.comedian.name.should.equal(`act1`);


    cha2.name.should.equal(`cha2`);
    cha2.movie.should.equal(movie.id);
    cha2.comedian.should.be.an(`object`);
    cha2.comedian.name.should.equal(`act2`);

  });

  it('Load a model with a deep nested relationship', async function () {

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
      populate : [`characters`, `characters.comedian`, `characters.comedian.fans`, `characters.backstory`],
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
    cha1.movie.should.equal(movie.id);
    cha1.comedian.should.be.an(`object`);
    cha1.comedian.name.should.equal(`act1`);

    cha1.backstory.should.be.an(`object`);
    cha1.backstory.content.should.equal(`backstory1`);

    cha2.backstory.should.be.an(`object`);
    cha2.backstory.content.should.equal(`backstory2`);


    cha2.name.should.equal(`cha2`);
    cha2.movie.should.equal(movie.id);
    cha2.comedian.should.be.an(`object`);
    cha2.comedian.name.should.equal(`act2`);

    cha1.comedian.fans.should.be.an(`array`);
    cha2.comedian.fans.should.be.an(`array`);

    cha1.comedian.fans.length.should.equal(2);
    cha2.comedian.fans.length.should.equal(2);



  });

  it('Results stringify to Json correctly', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    ananas.models.book = {
      tableName : `book`,
      attributes : {
        id : String,
        title : String,
        description : String,
        stars : Number,
        author : String,
      },
      associations : {
        author : {
          targetModel : `author`,
          sourceAttribute : `author`,
          targetAttribute : `id`,
        }
      },

    };

    const books = await ananas.book.find({
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

    const str = JSON.stringify(book);

    const parsedBook = JSON.parse(str);

    should.exist(parsedBook);
    parsedBook.title.should.equal(`t2`);
    parsedBook.author.should.be.an(`object`);
    parsedBook.author.name.should.equal(`n2`);
    Object.keys(parsedBook).length.should.equal(Object.keys(book).length);

  });


})

