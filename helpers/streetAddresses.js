const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  getStreets: function(streetName, callback) {
    var sql = `SELECT * FROM public.view_all_streets where streetname ilike '%${streetName}%' order by streetname LIMIT 50`;

    const pg = new postgres({ dbName: "weblive" });
    pg.selectAll(sql, result => {
      callback(result);
    });
  }
};
