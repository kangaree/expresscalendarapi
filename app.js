var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require("passport");
var session = require("express-session");
var db = require("./db");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var calendarsRouter = require('./routes/calendars');
var authRouter = require("./routes/auth");

var app = express();

// Allow CORS for local development
if (process.env.NODE_ENV === "development") {
  var cors = require("cors");
  app.use(
    cors({
      origin: "http://localhost:3001",
      credentials: true, // Allow credentials (cookies) to be sent
    })
  );
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      pool: db,
    }),
    // Move this to db.js later
    secret: process.env.PG_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate("session"));

app.use('/', indexRouter);
app.use('/', authRouter);
app.use("/", calendarsRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
