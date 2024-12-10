const postgres = require("./postgres");

module.exports = {
  bufferGeometry: function (obj, callback) {
    const geoJSON = obj.geoJSON;
    const distance = obj.distance;
    const srid = obj.srid;
    const sql = `SELECT ST_AsGeoJSON(ST_Buffer(ST_SetSRID(ST_GeomFromGeoJSON($1), $2), $3)) As geojson`;
    var values = [geoJSON, srid, distance];
    const pg = new postgres({ dbName: "weblive" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },

  getGeometryCenter: function (obj, callback) {
    const geoJSON = obj.geoJSON;
    const srid = obj.srid;
    const sql = `SELECT ST_AsGeoJSON(weblive.public.fn_sc_find_geometry_center(ST_SetSRID(ST_GeomFromGeoJSON($1), $2))) As geojson`;
    var values = [geoJSON, srid];

    const pg = new postgres({ dbName: "weblive" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },

  getEpsgWkt: function (epsgCode, callback) {
    const sql = `SELECT srtext as wkt FROM spatial_ref_sys WHERE srid = $1`;
    var values = [epsgCode];

    const pg = new postgres({ dbName: "weblive" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },

  getEpsgProj4: function (epsgCode, callback) {
    const sql = `SELECT proj4text as proj4 FROM spatial_ref_sys WHERE srid = $1`;
    var values = [epsgCode];

    const pg = new postgres({ dbName: "weblive" });
    pg.selectFirstWithValues(sql, values, (result) => {
      callback(result);
    });
  },
};
