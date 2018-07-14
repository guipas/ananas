const id = require('uuid').v4;
const moment = require('moment');

const author = [
  [ `id`  ,   `name` ,       `bio`      ],
  [ id()  ,   `n1`    ,      `b1`       ],
  [ id()  ,   `n2`    ,      `b2`       ],
  [ id()  ,   `n3`    ,      `b3`       ],
  [ id()  ,   `n4`    ,      `b4`       ],
  [ id()  ,   `n5`    ,      `b5`       ],
];

const book = [
  [ `id`  ,   `title` ,    `description`  , `stars` ,   `author` ],
  [ id()  ,   `t1`    ,      `d1`         ,  0      ,   author[1][0] ],
  [ id()  ,   `t2`    ,      `d2`         ,  1      ,   author[2][0] ],
  [ id()  ,   `t3`    ,      `d3`         ,  2      ,   author[2][0] ],
  [ id()  ,   `t4`    ,      `d4`         ,  3      ,   author[3][0] ],
  [ id()  ,   `t5`    ,      `d5`         ,  3      ,   author[4][0] ],
];

const car = [
  [ `id`  ,   `model` ,    `description`  ],
  [ id()  ,   `m1`    ,      `cd1`         ],
  [ id()  ,   `m2`    ,      `cd2`         ],
  [ id()  ,   `m3`    ,      `cd3`         ],
  [ id()  ,   `m4`    ,      `cd4`         ],
  [ id()  ,   `m5`    ,      `cd5`         ],
];

const drivers = [
  [ `id`  ,   `name` ,    `vehicule`           ],
  [ id()  ,   `n1`    ,      `m1`              ],
  [ id()  ,   `n2`    ,      `m2`              ],
  [ id()  ,   `n3`    ,      `m3`              ],
  [ id()  ,   `n4`    ,      `m4`              ],
  [ id()  ,   `n5`    ,      `m5`              ],
];

const movie = [
  [ `id`  ,   `title` ,                         ],
  [ id()  ,   `mo1`    ,                        ],
];


const actor = [
  [ `id`                                    ,   `name`    ,     ],
  [ `f10e0a4a-8d5a-4b54-871f-0f919fa2178b`  ,   `act1`    ,     ],
  [ `ea37f579-1436-4421-984c-7c139206c31b`  ,   `act2`    ,     ],
];

const character = [
  [ `id`  ,   `name` ,          `movie`        , `actor_id`        ],
  [ id()  ,   `cha1`    ,       movie[1][0]    ,   actor[1][0]  ],
  [ id()  ,   `cha2`    ,       movie[1][0]    ,   actor[2][0]  ],
];

const fans = [
  [ `id`  ,   `name` ,          `id_actor`     ,  ],
  [ id()  ,   `fan1`    ,       actor[1][0]    ,  ],
  [ id()  ,   `fan2`    ,       actor[1][0]    ,  ],
  [ id()  ,   `fan3`    ,       actor[2][0]    ,  ],
  [ id()  ,   `fan4`    ,       actor[2][0]    ,  ],
];

const backstory = [
  [ `id`  ,   `content` ,          `character`          ,  ],
  [ id()  ,   `backstory1`    ,      character[1][0]    ,  ],
  [ id()  ,   `backstory2`    ,      character[2][0]    ,  ],
];

const ship = [
  [ `id`  ,   `name`     ,      `options`                ,    `capacity`  , `size`  , `builtAt`                                  ,    `createdAt`                            , `departure`                              , `active`  ],
  [ id()  ,   `ship1`    ,      `{ "test" : "test" }`    ,         3      ,  2.5    , moment(`201701`, `YYYYMM`).toISOString()   , moment(`201701`, `YYYYMM`).toISOString()  , moment(`201701`, `YYYYMM`).toISOString() , true      ],
  [ id()  ,   `ship2`    ,      { test : 'test'    }     ,         3      ,  2.5    , moment(`201701`, `YYYYMM`).toISOString()   , moment(`201701`, `YYYYMM`).toISOString()  , moment(`201701`, `YYYYMM`).toISOString() , true      ],
];

module.exports = {
  book,
  author,
  car,
  drivers,
  movie,
  actor,
  character,
  fans,
  backstory,
  ship,
};
