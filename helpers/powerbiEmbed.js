const config = require("../config").powerbi;
const fetch = require("./fetchWrapper");
const fs = require("fs");
var path = require("path");
const sqlServer = require("./sqlServer");
const ss = new sqlServer({ dbName: "tabular" });
var uuid = require("uuid");

module.exports = class PowerBIEmbed {
  constructor(opt) {}
  getEmbedToken(report, callback) {
    const tokenLifeTime = 10;
    const url = `https://api.powerbi.com/v1.0/myorg/GenerateToken`;
    const reportConfig = {};
    this.getToken((token) => {
      // console.log(token.access_token);
      this.getReportId(token.access_token, report, (response) => {
        if (response && response.id) {
          // console.log(response);

          reportConfig["Id"] = response.id;
          reportConfig["EmbedUrl"] = response.embedUrl;
          reportConfig["Type"] = response.reportType;
          reportConfig["EmbedToken"] = {};
          reportConfig["MinutesToExpiration"] = tokenLifeTime;
          reportConfig["DefaultPage"] = null;
          reportConfig["MobileDefaultPage"] = null;
          const reportId = response.id;
          var body = {
            lifetimeInMinutes: tokenLifeTime,
            reports: [
              {
                allowEdit: false,
                id: reportId,
              },
            ],
          };
          return fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token.access_token,
            },

            redirect: "follow",
            body: JSON.stringify(body),
          })
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              // console.log(json);

              reportConfig.EmbedToken["Token"] = json.token;
              reportConfig.EmbedToken["TokenId"] = json.tokenId;
              reportConfig.EmbedToken["Expiration"] = `\/Date(${new Date(json.expiration).getTime()})\/`;
              callback(reportConfig);
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          callback({ error: "Report not found" });
        }
      });
    });
  }
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
  setReportParameters(report, objParams, callback) {
    let batchId = uuid.v4();

    const params = objParams.params;
    let promises = [];
    console.log(params);
    params.forEach((param) => {
      let sql = "exec [usp_PBI_add_report_parameter] @report, @name, @value, @type, @batchId";
      let values = [
        { name: "report", type: "NVarChar", typeOpts: { length: 50 }, value: report },
        { name: "name", type: "NVarChar", typeOpts: { length: 50 }, value: param.name },
        { name: "value", type: "NVarChar", typeOpts: { length: 8000 }, value: param.value },
        { name: "type", type: "NVarChar", typeOpts: { length: 50 }, value: param.type },
        { name: "batchId", type: "UniqueIdentifier", value: batchId },
      ];

      promises.push(
        new Promise((resolve, reject) => {
          ss.executeQueryWithValues(sql, values, (result) => {
            console.log(result);
            if (result && result[0] && result[0].BatchID) {
              resolve();
            } else {
              reject();
            }
          });
        })
      );
    });

    Promise.allSettled(promises).then(() => {
      callback(batchId);
    });
  }
};
