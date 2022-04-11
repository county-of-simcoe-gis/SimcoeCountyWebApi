var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");
var helmet = require("helmet");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var asyncRouter = require("./routes/async");
var settingsRouter = require("./routes/settings");
var reportsRouter = require("./routes/reports");

var app = express();
app.use(cors());
app.use(helmet());

app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
    arrayLimit: 50000,
    type: "application/x-www-form-urlencoding",
  })
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(function (req, res, next) {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) console.dir(req.body);
  next();
});
app.use(function (req, res, next) {
  var err = null;
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    err = e;
  }
  if (err) {
    console.warn(`Invalid URL Request - ${req.url}`);
    res.status(404).send();
  }
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/async", asyncRouter);
app.use("/settings", settingsRouter);
app.use("/reports", reportsRouter);
// app.get("*", function (req, res, next) {
//   console.warn(`Path not found - ${req.url}`);
//   res.status(404).send("");
// });

app.use(function (req, res, next) {
  if (!res._headerSent) {
    console.warn(`Path not found - ${req.url}`);
    return res.status(404).send();
  }
});

app.use(function (err, req, res, next) {
  if (!res._headerSent) {
    console.error(err);
    return res.status(500).send({ error: err });
  }
});

app.use(bodyParser);

module.exports = app;
