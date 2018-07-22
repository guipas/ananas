
## ANANAS ORM

*With Ananas ORM models look like this :*

```js
module.exports = {

  name : 'user',

  tableName : 'user',

  attributes : {
    id : String,
    firstname : String,
    lastname : String,
    birthday : Date,
    salary : Number,
  },

  associations : {
    account () {
      return this.hasOne('account');
    },
  },

  methods : {
    sayHello () {
      return `Hello ${this.fullname}`;
    },
  },

  computed : {
    fullname () {
      return `${this.firstname} ${this.lastname}`;
    },
  },

};
```

## Installation

```
npm install ananas
```

```js
const knex = require('knex')({
  // your knex config
});

const ananas = require('ananas')(knex);

ananas.models.user = require('./models/user.js');

const user = await ananas.user.find({ name : `john` });
```

