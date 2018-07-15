"use strict";

require(`./setup.js`);
// const assert = require('chai').assert;
const should = require('chai').should();
const fs = require('fs-extra');
const uuid = require('uuid');
const db = require(`./db`);
const ananas = require('../ananas')(db.knex);
const _ = require('lodash');

describe(`Associations`, function () {

  this.timeout(5000);

  it('Source attribute must be defined explicitly in model or error is thrown', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    let failed = false;

    try {
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
    } catch (e) {
      failed = true;
    }

    failed.should.equal(true);
  });

  it('Source attribute must be defined explicitly in model', async function () {

    const data = require('./fixtures/simple.fixture');
    await db.loadData(data);

    let failed = false;

    try {
      ananas.models.magazine = {
        tableName : `book`,
        attributes : {
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
    } catch (e) {
      failed = true;
    }

    failed.should.equal(false);
  });
})

