const config = require("../config").powerbi;
const fetch = require("./fetchWrapper");
const fs = require("fs");
var path = require("path");

module.exports = class PowerBI {
  constructor(opt) {}
  getToken(callback) {
    const url = `https://login.microsoftonline.com/${config.tenantId}/oauth2/token`;

    var urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", config.grantType);
    urlencoded.append("client_id", config.clientId);
    urlencoded.append("resource", config.resource);
    urlencoded.append("scope", config.scope);
    urlencoded.append("client_secret", config.clientSecret);

    return fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow",
      body: urlencoded,
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        callback(json);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  getReportId(token, reportName, callback) {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports`;
    return fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + token,
      },
      redirect: "follow",
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        // console.log("getReportId", json);

        if (json.value) {
          const selectedReport = json.value.filter((report) => report.name === reportName)[0];
          callback(selectedReport);
        } else {
          callback();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  submitReport(token, reportId, data = {}, callback) {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${reportId}/ExportTo`;
    //console.log("submitReport", JSON.stringify(data));

    return fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      redirect: "follow",
      body: JSON.stringify(data),
      // {
      //     "format": "PDF",
      //     "paginatedReportConfiguration":{
      //         "parameterValues":[
      //             {"name": "ReportParameter1", "value": "TestParameterHere"}
      //         ]
      //     }
      // }
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        // console.log("submitReport", json);

        callback(json);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  checkStatus(token, reportId, exportId, interval, startTime, callback) {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${reportId}/exports/${exportId}`;
    return fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Authorization: "Bearer " + token,
      },
      redirect: "follow",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log("checkStatus", Date.now() - startTime, data.status);
        if (data.percentComplete === 100 && data.status === "Succeeded") {
          callback(data);
        } else if (data.percentComplete < 100 && data.status !== "Failed") {
          setTimeout(() => {
            this.checkStatus(token, reportId, exportId, interval, startTime, callback);
          }, interval);
        } else if ((data.percentComplete === 100 && data.status !== "Succeeded") || data.status === "Failed") {
          callback("ERROR");
          console.log("checkStatus - ERROR", data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    // return {
    //   "@odata.context": "http://api.powerbi.com/v1.0/myorg/groups/30de3e57-104f-41c4-981f-36e411420b8e/$metadata#exports/$entity",
    //   id: "Mi9CbG9iSWRWMi1jNjA4MGQ5MS00Y2JiLTQzMzMtODI4ZC0xOGJhN2YzZmZhYTR1WkpWaGRGT2lmWnVWTjlxOW1YWk5BLWVUbjNzUkJqMDZUbnBnYndGRVZvPS4=",
    //   createdDateTime: "2023-06-05T12:41:15.3271842Z",
    //   lastActionDateTime: "2023-06-05T12:41:36.4270894Z",
    //   reportId: "97073025-0744-492d-b857-2e3e0a95f092",
    //   reportName: "API Parameter Test",
    //   status: "Succeeded",
    //   percentComplete: 100,
    //   resourceLocation:
    //     "https://api.powerbi.com/v1.0/myorg/groups/30de3e57-104f-41c4-981f-36e411420b8e/reports/97073025-0744-492d-b857-2e3e0a95f092/exports/Mi9CbG9iSWRWMi1jNjA4MGQ5MS00Y2JiLTQzMzMtODI4ZC0xOGJhN2YzZmZhYTR1WkpWaGRGT2lmWnVWTjlxOW1YWk5BLWVUbjNzUkJqMDZUbnBnYndGRVZvPS4=/file",
    //   resourceFileExtension: ".pdf",
    //   expirationTime: "2023-06-06T12:41:16.239304Z",
    // };
  }

  downloadReport(token, url, callback) {
    return fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        Authorization: "Bearer " + token,
      },
      redirect: "follow",
    })
      .then((response) => response.blob())
      .then((blob) => blob.arrayBuffer())
      .then((arrayBuffer) => Buffer.from(arrayBuffer))
      .then((result) => callback(result))
      .catch((error) => {
        console.error(error);
      });
  }
  runReport(report, reportParams = undefined, reportName, format = "PDF", callback) {
    if (report.indexOf("/") !== -1) report = report.split("/").reverse()[0];
    console.log("Report Generation Started", 0);
    const start = Date.now();
    const formats = {
      PDF: "PDF",
      EXCEL: "XLSX",
      WORD: "DOCX",
      CSV: "CSV",
    };
    try {
      const params = {
        format: formats[format.toUpperCase()],
      };
      if (reportParams)
        params["paginatedReportConfiguration"] = {
          parameterValues: reportParams,
        };
      this.getToken((response) => {
        console.log("getToken", Date.now() - start);

        // console.log("getToken", response);
        if (response.access_token) {
          const token = response.access_token;
          this.getReportId(token, report, (response) => {
            console.log("getReportId", Date.now() - start);

            // console.log("getReportId", response);
            if (response.id) {
              const reportId = response.id;
              this.submitReport(token, reportId, params, (response) => {
                console.log("submitReport", Date.now() - start);

                // console.log("submitReport", response);
                if (response.id) {
                  const exportId = response.id;
                  console.log("checkStatus start", Date.now() - start);
                  this.checkStatus(token, reportId, exportId, 250, start, (response) => {
                    console.log("checkStatus end", Date.now() - start);

                    if (response !== "ERROR")
                      this.downloadReport(token, response.resourceLocation, (file) => {
                        console.log("downloadReport", Date.now() - start);

                        // console.log("downloadReport", file);
                        const fnTemplate = (reportName, dateStamp, format) => `reports/${reportName}_${dateStamp}${format}`;
                        const fn = fnTemplate(reportName || response.reportName, Date.now(), response.resourceFileExtension);
                        fs.writeFile(fn, file, "base64", (error) => {
                          if (error) {
                            console.log("error");
                            callback("Error: " + error);
                          } else {
                            callback(path.resolve(fn));
                          }
                        });
                      });
                  });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
      callback("Error: " + error);
    }
  }
};
