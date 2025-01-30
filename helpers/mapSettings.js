const postgres = require("./postgres");

module.exports = {
  getMap: function (id, callback) {
    var sql = `SELECT json FROM public.usp_get_map_settings($1,$2,$3)`;
    var values = [id, null, false];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },
  getMapVersion: function (id, version, callback) {
    var sql = `SELECT json, published FROM public.usp_get_map_settings($1,$2,$3)`;
    var values = [id, version, false];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },
  getDefaultMap: function (callback) {
    var sql = `SELECT json FROM public.usp_get_map_settings($1,$2,$3)`;
    var values = [null, null, false];

    const pg = new postgres({ dbName: "tabular" });
    try {
      pg.selectFirstWithValues(sql, values, (result) => {
        callback(result);
      });
    } catch (e) {
      console.log(e);
    }
  },
};
