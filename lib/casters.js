const _ = require('lodash');

module.exports = {
  [Object] : {
    parse : val => typeof val === `object` ? val : JSON.parse(val),
    validate : val => typeof val === `object`,
    format : JSON.stringify,
  },
  [String] : {
    parse : _.toString,
    validate : _.isString,
    format : _.toString,
  },
  [Number] : {
    parse : _.toNumber,
    format : _.toNumber,
    validate : _.isNumber,
  },
  [Date] : {
    parse : val => _.isDate(val) ? val : new Date(val),
    format : val => val.toISOString && val.toISOString() || val,
    validate : _.isDate,
  },
  [Boolean] : {
    parse : val => val && true,
    format : val => val && true,
    validate : _.isBoolean,
  },

};