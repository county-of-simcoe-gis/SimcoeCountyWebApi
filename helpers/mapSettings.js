const postgres = require("./postgres");

module.exports = {
  getMap: function (id, callback) {
    var sql = `select json from public.tbl_map_settings where is_secured = false and id = $1`;
    var values = [id];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },
  getDefaultMap: function (callback) {
    var sql = `select json from public.tbl_map_settings where is_secured = false and is_default = true`;
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirst(sql, (result) => {
      callback(result);
    });
  },
};
