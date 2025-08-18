const postgres = require("./postgres");

module.exports = {
  getAllMaps: function (callback) {
    var sql = `SELECT map_name,description,allowed_roles,is_secured,is_default FROM public.usp_get_all_maps($1)`;
    var values = [false];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAllWithValues(sql, values, (result) => {
      // Check if result is an error object
      if (result && result.error) {
        console.error("Error in getAllMaps:", result.error);
        callback(result);
        return;
      }

      // Check if result is empty array
      if (!result || result.length === 0) {
        console.warn("getAllMaps returned no records");
        callback([]);
        return;
      }

      callback(result);
    });
  },
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
