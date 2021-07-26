const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  insertMyMaps: function (json, callback) {
    console.log("Add My Maps");
    // FORMAT THE DATE
    var dtString = common.getSqlDateString(new Date());

    // BUILD SQL
    var insertSql = `INSERT INTO public.tbl_mymaps (json,date_created) values ($1,$2) RETURNING id;`;
    var values = [JSON.stringify(json), dtString];
    // INSERT RECORD
    const pg = new postgres({ dbName: "tabular" });
    pg.insertWithReturnId(insertSql, values, (id) => {
      callback(id);
    });
  },

  getMyMaps: function (id, callback) {
    console.log("Get My Maps");
    var sql = `select * from public.tbl_mymaps where id = $1`;
    var values = [id];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },
};
