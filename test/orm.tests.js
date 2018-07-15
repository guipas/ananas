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

  describe('Test suite helpers works', function() {
    it('Fills and empty when we need to', async function () {

      return db.loadData(require('./fixtures/simple.fixture'))
      .then(() => db.knex.select().table('book'))
      .then(res => res.length)
      .should.eventually.equal(5)
      .then(() => db.empty())
      .then(() => db.knex.select().table('book'))
      .then(res => res.length)
      .should.eventually.equal(0)
    });
  });


});
