const id = require('uuid').v4;


const book = [
  [ `id`  ,   `title` ,    `description`  , `stars`  ],
  [ id()  ,   `t1`    ,      `d1`         ,  0       ],
  [ id()  ,   `t2`    ,      `d2`         ,  1       ],
  [ id()  ,   `t3`    ,      `d3`         ,  2       ],
  [ id()  ,   `t4`    ,      `d4`         ,  3       ],
  [ id()  ,   `t5`    ,      `d5`         ,  3       ],
]


module.exports = {
  book,
};
