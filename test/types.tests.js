"use strict";

require(`./setup.js`);
const should = require('chai').should();
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');
const moment = require('moment');

describe(`Types`, function () {

  this.timeout(5000);

  it('Cast basic types  ', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    const ships = await ananas.ship.find();

    const ship1 = ships[0];

    should.exist(ships);
    should.exist(ship1);

    ship1.name.should.be.a(`string`);
    ship1.capacity.should.be.a(`number`);
    ship1.size.should.be.a(`number`);
    ship1.size.should.equal(2.5);
    // ship1.active.should.be.a(`boolean`);
    // ship1.active.should.equal(true);

  });

  it('Cast dates and json if defined in model  ', async function () {

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
    ship.name.should.be.a(`string`);
    ship.capacity.should.be.a(`number`);
    ship.size.should.be.a(`number`);
    ship.size.should.equal(2.5);
    ship.active.should.be.a(`boolean`);
    ship.active.should.equal(true);
    ship.options.should.be.an(`object`);
    ship.options.test.should.equal(`test`);
    ship.builtAt.should.be.a(`date`);
    ship.createdAt.should.be.a(`date`);
    ship.departure.should.be.a(`date`);

  });

});

