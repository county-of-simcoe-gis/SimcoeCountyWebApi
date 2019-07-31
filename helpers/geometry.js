const postgres = require("./postgres");

module.exports = {
  bufferGeometry: function(obj, callback) {
    const geoJSON = obj.geoJSON;
    const distance = obj.distance;
    const srid = obj.srid;
    const sql = `SELECT ST_AsGeoJSON(ST_Buffer(ST_SetSRID(ST_GeomFromGeoJSON('${geoJSON}'), ${srid}), ${distance})) As geojson`;
    const pg = new postgres({ dbName: "weblive" });
    pg.selectFirst(sql, result => {
      callback(result);
    });
  }
};
