module.exports = function buildWheres (qb, whereArgs, parentAttribute) {

  Object.keys(whereArgs).forEach(attribute => {
    const value = whereArgs[attribute];
    switch (attribute) {

      case `or`:
        value.forEach(v => {
          qb = qb.orWhere(subQb => buildWheres(subQb, v));
        });
        break;

      case `!`:
        if (Array.isArray(value)) {
          qb = qb.whereNotIn(parentAttribute, value);
        } else {
          qb = qb.whereNot(parentAttribute, value);
        }
        break;

      case `<`   :
      case `>`   :
      case `<=`  :
      case `>=`  :
      case `=`   :
      case `like`:
        qb = qb.andWhere(parentAttribute, attribute, value);
        break;

      default:
        if (Array.isArray(value)) {
          qb = qb.whereIn(attribute, value);
        } else if (typeof value === `object`) {
          qb = qb.andWhere(subQb => buildWheres(subQb, value, attribute));
        } else {
          qb = qb.andWhere(attribute, `=`, value);
        }
    }
  })
}
