var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter')
const partnerRouter = require('./routes/partnerRouter')
const promotionRouter = require('./routes/promotionRouter')
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware applied in the order they appear
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//don't need authentication for ^

//so authentication starts here to serve static files-- creating custom middleware function named auth
function auth(req, res, next) { //all express middleware functions require req and res objects as params, next is optional
  console.log(req.headers)
  const authHeader = req.headers.authorization
  if (!authHeader) { //if null, then didn't get any authentication info (no username/pw)
    const err = new Error('You are not authenticated!')
    res.setHeader('WWW-Authenticate', 'Basic') //lets client know that server is requesting auth and auth method being requested is Basic
    err.status = 401 //error code for when auth info not provided
    return next(err) //pass err message to express
  }

  //sends error message back and requests clients credentials
  //if there is an auth header then decode username and pw info, then parse into array ['admin', 'password']
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':') //Buffer: global in NodeJS (don't need to be required)
  const user = auth[0]
  const pass = auth[1]
  //basic validation
  if (user === 'admin' && pass === 'password') { //if true then pass to next middleware function
    return next() //authorized
  } else {
    const err = new Error('You are not authenticated!')
    res.setHeader('WWW-Authenticate', 'Basic')
    err.status = 401
    return next(err)
  }
}
app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter)
app.use('/partners', partnerRouter)
app.use('/promotions', promotionRouter)

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