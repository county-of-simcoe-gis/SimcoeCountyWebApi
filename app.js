"use strict";
const fastify = require("fastify");
const config = require("./config");
const pathToSwaggerUi = require("swagger-ui-dist").absolutePath();
const fs = require("fs");
const packageJson = require("./package.json");
const documentationOutputFile = require("path").join(__dirname, "./api-doc.json");
const _workaround = require("./_workaround");

// CREATE SERVER
const serverPort = process.env.PORT || config.app.port;
const server = fastify({
  logger: false,
  routerOptions: {
    maxParamLength: 1000,
  },
});

// CORS Configuration
server.register(require("@fastify/cors"), {
  origin: ["http://localhost:3000", "https://opengis.simcoe.ca", "https://opengis2.simcoe.ca", "https://forestryapps.simcoe.ca", "https://cam.simcoe.ca"],
  credentials: true,
  allowedHeaders: ["Authorization", "Origin", "X-Requested-With", "Content-Type", "Accept", "AccessToken"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Body parser for URL-encoded and JSON
server.register(require("@fastify/formbody"));

// Static files for Swagger UI
server.register(require("@fastify/static"), {
  root: pathToSwaggerUi,
  prefix: packageJson.defaultRoute + "/docs/",
  decorateReply: false,
});

// Request logger hook
server.addHook("onRequest", async (request, reply) => {
  console.log(new Date().toLocaleString("en-US", { timeZone: "EST" }), request.method, request.url.replace(/\n|\r/g, ""));
});

// URL validation middleware
server.addHook("onRequest", async (request, reply) => {
  try {
    if (!request.url) throw new Error("Invalid URL");
    else decodeURIComponent(request.url);
  } catch (e) {
    console.warn(`Invalid URL Request- ${request.url.replace(/\n|\r/g, "")}`);
    reply.code(404).send();
  }
});

require("./routes/routeBuilder")(server, packageJson.defaultRoute);

server.get(packageJson.defaultRoute + `/docs.json`, async (request, reply) => {
  const documentation = require(documentationOutputFile);
  reply.send(documentation);
});

const swaggerIndexContent = fs
  .readFileSync(`${pathToSwaggerUi}/swagger-initializer.js`)
  .toString()
  .replace("https://petstore.swagger.io/v2/swagger.json", `https://${packageJson.host}${packageJson.basePath}docs.json`);

server.get(packageJson.defaultRoute + "/docs/swagger-initializer.js", async (request, reply) => {
  reply.code(200).header("Content-Type", "application/javascript").send(swaggerIndexContent);
});

server.get(packageJson.defaultRoute + "/docs", async (request, reply) => {
  reply.redirect(`${packageJson.basePath}docs/index.html`);
});

// Catch-all 404 handler
server.setNotFoundHandler(async (request, reply) => {
  console.warn(`Invalid URL Request- ${request.url.replace(/\n|\r/g, "")}`);
  reply.code(404).send();
});

server.listen({ port: serverPort, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("\n OpenGIS API");
  console.log("Listening on port: " + serverPort);
  console.log(`Server listening at ${address}`);
});
