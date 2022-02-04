const { getItemDataSources } = require("mssql-ssrs/lib/reportService");
exports.app = {
  port: 8085,
  emailSMTPServer: "sample.server.local",
  fromEmail: "email@sample.local",
  toEmail: "email@sample.local",
  mapUrl: "https://opengis.simcoe.ca/?",
  feedbackUrl: "https://opengis.simcoe.ca/feedback?",
  allowedOrigins: ["localhost:8085"],
  captchaDev: "",
  captchaProduction: "",
  servicePingerSecret: "",
};
exports.postGres = {
  connectionTabular: {
    user: "userName",
    host: "hostname",
    database: "dbname",
    password: "password",
    port: 5432,
  },
  connectionWeblive: {
    user: "userName",
    host: "hostname",
    database: "dbname",
    password: "password",
    port: 5432,
  },
};
exports.sqlServer = {
  connectionTabular: {
    user: "userName",
    host: "hostname",
    database: "dbname",
    password: "password",
    port: 1433,
  },
  connectionOasys: {
    user: "userName",
    host: "hostname",
    database: "dbname",
    password: "password",
    port: 1433,
  },
  connectionWebLive: {
    user: "userName",
    host: "hostname",
    database: "dbname",
    password: "password",
    port: 1433,
  },
  reportServerConfig: {
    soapConfig: {
      username: "userName",
      password: "password",
      domain: "domain",
    },
    server: "http://sample.server.local/reportserver",
  },
};
