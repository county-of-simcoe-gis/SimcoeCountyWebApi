var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
//var logger = require("morgan");
//replaced morgan with winston
const logger = require('./helpers/logger');

var bodyParser = require("body-parser");
var cors = require("cors");
var helmet = require("helmet");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var asyncRouter = require("./routes/async");
var settingsRouter = require("./routes/settings");

var app = express();
app.use(cors());
//app.use(logger("dev"));
app.use(helmet());

app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
    arrayLimit: 50000,
    type: "application/x-www-form-urlencoding"
  })
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/async", asyncRouter);
app.use("/settings", settingsRouter);

app.get('*', function(req, res){
  logger.warn(`Invalid URL Request- ${req.url}`);
  res.status(404).send();
});
app.use(bodyParser);
app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
    arrayLimit: 50000,
    type: "application/x-www-form-urlencoding"
  })
);

module.exports = app;
