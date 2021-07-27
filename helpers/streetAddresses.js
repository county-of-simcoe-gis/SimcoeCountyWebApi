const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  getStreets: function (streetName, callback) {
    var sql = `SELECT * FROM public.view_all_streets where streetname ilike '%' || $1 || '%' order by streetname LIMIT 50`;
    var values = [streetName];
    const pg = new postgres({ dbName: "weblive" });
    pg.selectAllWithValues(sql, values, (result) => {
      callback(result);
    });
  },
};
