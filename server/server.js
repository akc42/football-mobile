/**
 * Created by alan on 31/07/14.
 */
/*
*  Copied from http://stackoverflow.com/questions/20793902/auth-between-a-website-and-self-owned-api
*/
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var jwt = require('jsonwebtoken');  //https://npmjs.org/package/node-jsonwebtoken
var expressJwt = require('express-jwt'); //https://npmjs.org/package/express-jwt

var secret = "MB_Footbill_15";


var app = express();

app.configure(function () {
  this.use(express.urlencoded());
  this.use(express.json());
  this.use('/api', expressJwt({secret: secret}));
});

//authentication endpoint
app.post('/authenticate', function (req, res) {
  //validate req.body.username and req.body.password
  //if is invalid, return 401
  var profile = {
    first_name: 'John',
    last_name: 'Foo',
    email: 'foo@bar.com',
    id: 123
  };

  var token = jwt.sign(profile, secret, {
    expiresInMinutes: 60*5
  });

  res.json({
    token: token
  });
});

//protected api
app.get('/api/something', function (req, res) {
  console.log('user ' + req.user.email + ' is calling /something');
  res.json({
    name: 'foo'
  });
});

//sample page
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

http.createServer(app).listen(8080, function () {
  console.log('listening on http://localhost:8080');
});
