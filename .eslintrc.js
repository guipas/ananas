
module.exports = {
  "env": {
      "es6": true,
      "node": true
  },
  "parserOptions": {
      "ecmaVersion": 8,
      "ecmaFeatures": {
          "experimentalObjectRestSpread": true,
        }
  },
  "extends": "eslint:recommended",
  "rules": {
    "no-console" : "off",
  },
};