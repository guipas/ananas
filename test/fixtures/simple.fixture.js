const id = require('uuid').v4;

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

const character = [
  [ `id`  ,   `name` ,          `movie`         ],
  [ id()  ,   `cha1`    ,       movie[1][0]      ],
  [ id()  ,   `cha2`    ,       movie[1][0]      ],
];


module.exports = {
  book,
  author,
  car,
  drivers,
  movie,
  character,
};
