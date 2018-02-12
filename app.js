var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var goods = require('./routes/goods');
var users = require('./routes/users');
var ejs = require('ejs')

var app = express();

// view engine setupa
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 登录拦截
app.use(function (req, res, next) {
  console.log(typeof req.cookies.userId)
  if (req.cookies.userId && req.cookies.userId !== 'undefined') {
    // 已登录
    console.log('已登录')
    next();
  } else {
    // 未登录
    console.log('未登录',req.path)
    if (req.path === '/goods/list' || req.path === '/users/login' || req.path === '/users/logout' || req.path === '/users/check') {
      // 可以防伪
      console.log('可以防伪')
      next();
    } else {
      // 不可以访问
      console.log('不可以访问', req.path)
      res.json({
        status: '401',
        msg: "需要登录",
        result: ''
      });
      return false;
    }
  }
});


app.use('/', index);
app.use('/users', users);
app.use('/goods', goods);

// 跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
    /让options请求快速返回/
  }
  else {
    next();
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
