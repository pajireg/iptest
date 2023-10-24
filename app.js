var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var os = require("os");
const AWS = require('aws-sdk');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
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

const nets = os.networkInterfaces();
console.log(os.platform());
console.log(os.type());
console.log(os.release());
const interfaces = nets["en0"];
const ipv4Interfaces = interfaces.filter((interface) => interface.family === "IPv4");
let ipAddress;
ipv4Interfaces.forEach((interface) => {
  ipAddress = interface.address;
});

console.log(`Server running at http://${ipAddress}:${process.pid}`);


// EC2 인스턴스 내에서 실행 중이어야 한다.
const ec2 = new AWS.EC2();

// EC2 메타데이터 엔드포인트에서 현재 인스턴스의 정보를 가져온다.
ec2.describeInstances({}, (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  // 현재 인스턴스의 정보를 가져온다.
  const instance = data.Reservations[0].Instances[0];

  // 공용 IP 주소를 가져온다.
  const publicIp = instance.PublicIpAddress;

  console.log('EC2 인스턴스의 공용 IP 주소:', publicIp);
});

module.exports = app;
