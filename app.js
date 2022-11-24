var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/article');
const { copyFile } = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// session config
app.use(session({
  secret: 'tsing',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 5 } // session length
}))

// login intercept #TODO
app.get('*', (req, res, next) => {
  const username = req.session.username;
  const path = req.path;
  if(path != '/login' && path != '/register') {
    if(!username) {
      res.redirect('/login');
    } else {
      next()
    }
  } else {
    next();
  }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/article', articleRouter)

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
