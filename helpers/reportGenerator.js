// const ssrs = require("./ssrs");
const PowerBI = require("./powerbi");

const sqlServer = require("./sqlServer");
const postgres = require("./postgres");

const ss = new sqlServer({ dbName: "tabular" });
// const reports = new ssrs();
const reports = new PowerBI();

module.exports = {
  async getPropertyReport(arn, callback) {
    var parameters = [{ Name: "ARN", Value: arn }];

    reports.runReport("/PropertyReports/Public", parameters, "PropertyReport", "PDF", (fn) => {
      console.log("Saved report to: " + fn);
      callback(fn);
    });
  },
  async getEconomicDevelopmentReportMLS(mls, callback) {
    var parameters = [{ Name: "MLSNUMBER", Value: mls }];

    reports.runReport("/EconomicDevelopment/EconomicDevelopmentPropertyReport", parameters, "EconomicDevelopmentPropertyReport", "PDF", (fn) => {
      console.log("Saved report to: " + fn);
      callback(fn);
    });
  },
};
