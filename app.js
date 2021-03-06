const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash=require('connect-flash');
const session=require('express-session');
const MongoStore=require('connect-mongo')(session);

const routes = require('./routes/index');
const settings=require('./setting')
// var users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  secret:settings.cookieSecret,
    key:settings.db,
    cookie:{maxAge:1000*60*60*24*30},
    store:new MongoStore({
      url:'mongodb://localhost/myblog'
    }),
    resave:false,
    saveUninitialized:true
}))
// app.use('/', index);
// app.use('/users', users);
routes(app);
// catch 404 and forward to error handler
app.use((req, res, next)=> {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(3000,()=>{
  console.log('node is ok');
})
module.exports = app;
