const dotenv = require("dotenv");
dotenv.config({});
dotenv.config({ path: `.env.${process.env.NODE_ENV}`, override: true });

exports.app = {
  port: process.env.PORT || 80,
  emailSMTPServer: process.env.APP_SMTP_SERVER,
  fromEmail: process.env.APP_EMAIL_FROM,
  toEmail: process.env.APP_EMAIL_TO,
  mapUrl: process.env.MAP_URL,
  feedbackUrl: process.env.FEEDBACK_URL,
  allowedOrigins: process.env.APP_ALLOWED_ORIGIN ? [...process.env.APP_ALLOWED_ORIGIN.split(",")] : ["localhost"],
  captcha: process.env.CAPTCH_SECRET,
};
exports.postGres = {
  connectionTabular: {
    user: process.env.PG_TABULAR_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_TABULAR_DB,
    password: process.env.PG_TABULAR_PASS,
    port: process.env.PG_PORT,
  },
  connectionWeblive: {
    user: process.env.PG_WEBLIVE_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_WEBLIVE_DB,
    password: process.env.PG_WEBLIVE_PASS,
    port: process.env.PG_PORT,
  },
};
exports.sqlServer = {
  connectionTabular: {
    user: process.env.SQL_TABULAR_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_TABULAR_DB,
    password: process.env.SQL_TABULAR_PASS,
    port: process.env.SQL_PORT,
  },
  connectionOasys: {
    user: process.env.SQL_OASYS_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_OASYS_DB,
    password: process.env.SQL_OASYS_PASS,
    port: process.env.SQL_PORT,
  },
  connectionWebLive: {
    user: process.env.SQL_WEBLIVE_USER,
    host: process.env.SQL_HOST,
    database: process.env.SQL_WEBLIVE_DB,
    password: process.env.SQL_WEBLIVE_PASS,
    port: process.env.SQL_PORT,
  },
  reportServerConfig: {
    soapConfig: {
      username: process.env.SSRS_USER,
      password: process.env.SSRS_PASS,
      domain: process.env.SSRS_DOMAIN,
    },
    server: process.env.SSRS_SERVER,
  },
};
exports.powerbi = {
  tenantId: process.env.POWERBI_TENANTID,
  workspaceId: process.env.POWERBI_WORKSPACEID,
  clientId: process.env.POWERBI_CLIENTID,
  clientSecret: process.env.POWERBI_CLIENT_SECRET,
  grantType: "client_credentials",
  resource: "https://analysis.windows.net/powerbi/api",
  scope: "https://analysis.windows.net/powerbi/api/.default",
};
