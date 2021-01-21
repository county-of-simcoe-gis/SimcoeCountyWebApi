var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var helmet = require("helmet");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var asyncRouter = require("./routes/async");
var settingsRouter = require("./routes/settings");

var app = express();
app.use(cors());
app.use(logger("dev"));
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
