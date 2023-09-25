"use strict";
var restify = require("restify");
var config = require("./config");
const pathToSwaggerUi = require("swagger-ui-dist").absolutePath();
const fs = require("fs");
const packageJson = require("./package.json");
var corsMiddleware = require("restify-cors-middleware2");
const documentationOutputFile = require("path").join(__dirname, "./api-doc.json");
const _workaround = require("./_workaround");

// CORS FOR RESTIFY
var cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ["http://localhost:3000", "https://opengis.simcoe.ca", "https://opengis2.simcoe.ca"],
  allowHeaders: ["Authorization, Origin, X-Requested-With, Content-Type, Accept,AccessToken"],
  exposeHeaders: [],
});

// CREATE SERVER
var serverPort = process.env.PORT || config.app.port;
var server = restify.createServer({
  name: packageJson.title || "API Server",
  version: packageJson.version || "1.0.0",
  maxParamLength: 1000,
});

server.pre(cors.preflight);
server.use(cors.actual);

// Ensure we don't drop data on uploads
server.pre(restify.pre.pause());

//TEMPORARY WORKAROUND FOR BUG IN RESTIFY
server.pre((req, res, next) => {
  try {
    if (!_workaround.strip(req.url)) req.url = "/";
    restify.pre.sanitizePath()(req, res, next);
  } catch (e) {
    console.error(e);
  }
});
//REMOVED BECAUSE OF BUG IN RESTIFY
// Clean up sloppy paths like //todo//////1//
// server.pre(restify.pre.sanitizePath());

// Handles annoying user agents (curl)
server.pre(restify.pre.userAgentConnection());

// Set a per request bunyan logger (with requestid filled in)
server.use(restify.plugins.requestLogger());

//Try parsing url and return 404 if invalid
server.use(function (req, res, next) {
  var err = null;
  try {
    if (!req.path) throw new Error("Invalid URL");
    else decodeURIComponent(req.path);
  } catch (e) {
    err = e;
  }
  if (err) {
    console.warn(`Invalid URL Request- ${req.url}`);
    res.status(404);
    res.send();
    next();
  }
  next();
});

// Use the common stuff you probably want
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

require("./routes/routeBuilder")(server, packageJson.defaultRoute);
server.get(packageJson.defaultRoute + `/docs.json`, (req, res, next) => {
  const documentation = require(documentationOutputFile);
  res.json(documentation);
  return next();
});

const swaggerIndexContent = fs
  .readFileSync(`${pathToSwaggerUi}/swagger-initializer.js`)
  .toString()
  .replace("https://petstore.swagger.io/v2/swagger.json", `https://${packageJson.host}${packageJson.basePath}docs.json`);

server.get(packageJson.defaultRoute + "/docs/swagger-initializer.js", (req, res, next) => {
  res.writeHead(200, {
    "Content-Length": Buffer.byteLength(swaggerIndexContent),
    "Content-Type": "application/javascript",
  });
  res.write(swaggerIndexContent);
  res.end();
});
server.get(packageJson.defaultRoute + "/docs", (req, res, next) => res.redirect(`${packageJson.basePath}docs/index.html`, next));
server.get(
  packageJson.defaultRoute + "/docs/*",
  restify.plugins.serveStatic({
    appendRequestPath: false,
    directory: pathToSwaggerUi,
    default: "index.html",
  })
);

server.get("*", function (req, res, next) {
  try {
    console.warn(`Invalid URL Request- ${req.url}`);
    res.send(404);
    next();
  } catch (e) {
    console.error(e.stack);
    res.status(500);
    res.send();
    next();
  }
});

server.listen(serverPort, function () {
  var consoleMessage = "\n OpenGIS API";
  consoleMessage += "\n %s server is listening at %s";
  console.log("Listening on port: " + serverPort);
});
