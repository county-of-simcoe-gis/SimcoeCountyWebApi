const ssrs = require("./ssrs");
const sqlServer = require("./sqlServer");
const postgres = require("./postgres");

const ss = new sqlServer({ dbName: "tabular" });
const reports = new ssrs();

module.exports = {
  async getPropertyReport(arn, callback) {
    try {
      const obj = JSON.parse(body);
      const geoJSON = obj.geoJson;
      const reportType = obj.reportType;
      const reportFormat = obj.reportFormat;

      const sql = "select string_agg(arn, '|') AS arns from weblive.sde.teranet_dapf where ST_Intersects(geom, ST_SetSRID(ST_GeomFromGeoJSON($1), 3857))";
      var values = [geoJSON];
      const pg = new postgres({ dbName: "weblive" });
      pg.selectFirstWithValues(sql, values, (result) => {
        if (result.arns === null) {
          callback("Zero Records");
        } else {
          var parameters = [
            { Name: "ARNS", Value: result.arns },
            { Name: "UsePartnerData", Value: false },
          ];

          reports.runReport(reportType, parameters, "Mailing_Labels", reportFormat, (fn) => {
            console.log("Saved report to: " + fn);
            callback(fn);
          });
        }
      });
    } catch (error) {
      callback(error);
    }
  },
  async getEconomicDevelopmentReportMLS(mls, callback) {
    var parameters = [{ Name: "MLSNUMBER", Value: mls }];

    reports.runReport("/EconomicDevelopment/EconomicDevelopmentPropertyReport", parameters, "EconomicDevelopmentPropertyReport", "PDF", (fn) => {
      console.log("Saved report to: " + fn);
      callback(fn);
    });
  },
};
