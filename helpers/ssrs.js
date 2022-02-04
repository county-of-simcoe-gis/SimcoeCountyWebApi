const config = require("../config").sqlServer;
const ssrs = require("mssql-ssrs");
const fs = require("fs");
var path = require("path");

module.exports = class SSRS {
  constructor(opt) {}

  async runReport(reportPath, reportParams, reportName, format, callback) {
    try {
      await ssrs.start(config.reportServerConfig.server, config.reportServerConfig.soapConfig);
      var report = await ssrs.reportExecution.getReport(reportPath, format, reportParams);
      const fnTemplate = (reportName, dateStamp, format) => `reports/${reportName}_${dateStamp}.${format}`;
      let fileExtension = format;
      if (format === "Word") fileExtension = "doc";
      else if (format === "Excel") fileExtension = "xlsx";
      const fn = fnTemplate(reportName, Date.now(), fileExtension);
      fs.writeFile(fn, report.Result, "base64", (error) => {
        if (error) {
          console.log("error");
          callback("Error: " + error);
        } else {
          callback(path.resolve(fn));
        }
      });
    } catch (error) {
      console.log(error);
      callback("Error: " + error);
    }
  }
};
