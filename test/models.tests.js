"use strict";

require(`./setup.js`);
// const assert = require('chai').assert;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');

describe('ORM', function() {
  this.timeout(5000);

  describe(`Models`, function () {

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
            model : `author`
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
            model : `writer`
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

    // it('Load a model with a custom 1:1 relationship', async function () {

    //   const data = require('./fixtures/simple.fixture');
    //   await db.loadData(data);

    //   ananas.models.magazine = {
    //     tableName : `book`,
    //     associations : {
    //       author : {
    //         model : `writer`
    //       }
    //     },
    //   };

    //   ananas.models.writer = {
    //     tableName : `author`,
    //     associations : {
    //       author : {
    //         model : `book`
    //       }
    //     },
    //   };

    //   const books = await ananas.magazine.find({
    //     title : `t2`,
    //     populate : [`author`],
    //   });

    //   should.exist(books);
    //   books.should.be.an(`array`);
    //   books.length.should.equal(1);
    //   const book = books.pop();
    //   should.exist(book);
    //   book.title.should.equal(`t2`);
    //   book.author.should.be.an(`object`);
    //   book.author.name.should.equal(`n2`);

    // });

    it('Load a model with a custom 1:1 relationship and custom source attribute', async function () {

      const data = require('./fixtures/simple.fixture');
      await db.loadData(data);

      ananas.models.magazine = {
        tableName : `book`,
        associations : {
          blogger : {
            model : `writer`,
            sourceAttribute : `author`,
          }
        },
      };

      ananas.models.writer = {
        tableName : `author`,
      };

      const books = await ananas.magazine.find({
        title : `t2`,
        populate : [`blogger`],
      });

      should.exist(books);
      books.should.be.an(`array`);
      books.length.should.equal(1);
      const book = books.pop();
      should.exist(book);
      book.title.should.equal(`t2`);
      book.blogger.should.be.an(`object`);
      book.blogger.name.should.equal(`n2`);

    });

    it('Load a model with a custom 1:1 relationship and full custom source and dest attributes', async function () {

      const data = require('./fixtures/simple.fixture');
      await db.loadData(data);

      ananas.models.driver = {
        tableName : `drivers`,
        associations : {
          car : {
            model : `car`,
            sourceAttribute : `vehicule`,
            targetAttribute : `model`,
          }
        },
      };

      // ananas.models.car = {
      // };

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

    it('Load a model with a custom 1:1 relationship and full custom source and dest attributes', async function () {

      const data = require('./fixtures/simple.fixture');
      await db.loadData(data);

      ananas.models.driver = {
        tableName : `drivers`,
        associations : {
          car : {
            model : `car`,
            sourceAttribute : `vehicule`,
            targetAttribute : `model`,
          }
        },
      };

      ananas.models.car = {
        associations : {
          theDriver : {
            model : `driver`,
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
            model : `character`,
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


  })




});
