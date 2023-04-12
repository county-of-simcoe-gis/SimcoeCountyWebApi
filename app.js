"use strict";
var restify = require("restify");
var config = require("./config");
const package_file = require("./package.json");

var corsMiddleware = require("restify-cors-middleware");
const swaggerUi = require("swagger-ui-restify");
const swaggerOptions = {
  explorer: false,
  customCss: ".swagger-ui .topbar { display: none }",
  baseURL: "docs",
  customSiteTitle: "API Documentation",
};
const documentationOutputFile = require("path").join(__dirname, "./api-doc.json");

// CORS FOR RESTIFY
var cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ["forestryapps.simcoe.ca", "http://localhost:3000", "https://opengis.simcoe.ca", "https://opengis2.simcoe.ca"],
  allowHeaders: ["Authorization, Origin, X-Requested-With, Content-Type, Accept,AccessToken"],
  exposeHeaders: [],
});

// CREATE SERVER
var serverPort = process.env.PORT || config.app.port;
var server = restify.createServer({
  name: package_file.title || "API Server",
  version: package_file.version || "1.0.0",
  maxParamLength: 1000,
});

server.pre(cors.preflight);
server.use(cors.actual);

// Ensure we don't drop data on uploads
server.pre(restify.pre.pause());

// Clean up sloppy paths like //todo//////1//
server.pre(restify.pre.sanitizePath());

// Handles annoying user agents (curl)
server.pre(restify.pre.userAgentConnection());

// Set a per request bunyan logger (with requestid filled in)
server.use(restify.plugins.requestLogger());

//Try parsing url and return 404 if invalid
server.use(function (req, res, next) {
  var err = null;
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    err = e;
  }
  if (err) {
    logger.warn(`Invalid URL Request- ${req.url}`);
    res.status(404).send();
  }
  next();
});

// Use the common stuff you probably want
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.dateParser());
server.use(restify.plugins.queryParser());
server.use(restify.plugins.gzipResponse());
server.use(
  restify.plugins.bodyParser({
    mapParams: true,
  })
); // Allows for JSON mapping to REST
server.use(restify.plugins.authorizationParser()); // Looks for authorization headers

// LOG ALL INCOMING REQUESTS
server.use(function (req, res, next) {
  console.log(new Date().toLocaleString("en-US", { timeZone: "EST" }), req.method, req.url);
  next();
});

require("./routes/routeBuilder")(server);
server.get(`/${swaggerOptions.baseURL}.json`, (req, res, next) => {
  const documentation = require(documentationOutputFile);
  res.json(documentation);
  next();
});

server.get(`/${swaggerOptions.baseURL}/*`, ...swaggerUi.serve);
server.get(`/${swaggerOptions.baseURL}`, (req, res, next) => swaggerUi.setup(require(documentationOutputFile), swaggerOptions));

// server.get(`/${swaggerOptions.baseURL}`, swaggerUi.setup(require(documentationOutputFile), swaggerOptions));
server.get("*", function (req, res, next) {
  console.warn(`Invalid URL Request- ${req.url}`);
  res.send(404);
  next();
});

server.listen(serverPort, function () {
  var consoleMessage = "\n OpenGIS API";
  consoleMessage += "\n %s server is listening at %s";
  console.log("Listening on port: " + serverPort);
});
