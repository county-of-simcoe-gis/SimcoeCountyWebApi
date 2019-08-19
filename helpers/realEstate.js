const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  getInfo: function(mlsId, callback) {
    var sql = `SELECT * FROM public.sc_mls_points_v2 where mlsno = '${mlsId}'`;
    const pg = new postgres({ dbName: "weblive" });
    pg.selectFirst(sql, result => {
      callback(result);
    });
  }
};
