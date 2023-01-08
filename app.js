const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const propertiesRouter = require('./routes/properties');
const resultRouter = require('./routes/result');
const historyRouter = require('./routes/history');
const configurationRouter = require('./routes/configuration');
const logRouter = require('./routes/log');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/properties', propertiesRouter);
app.use('/history', historyRouter);
app.use('/result', resultRouter);
app.use('/configuration', configurationRouter);
app.use('/log', logRouter);

app.disable('etag');

// catch 404 and forward to error handler
app.use(function (_req, _res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
