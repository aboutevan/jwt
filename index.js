var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var passport = require('passport');
var passportJwt = require('passport-jwt');

var ExtractJwt = passportJwt.ExtractJwt;
var JwtStrategy = passportJwt.Strategy;

var users = [
  {
    id: 1,
    name: 'evan',
    password: 'password'
  },
  {
    id: 2,
    name: 'maiko',
    password: 'maiko'
  }
];

var jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'fido';

var strategy = new JwtStrategy(jwtOptions, function(payload, next) {
  console.log('payload received: ', payload);
  // usually db call:
  var user = users[_.findIndex(users, {id: payload.id})];
  if(user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

var app = express();

app
  .use(passport.initialize())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json());

app.get('/', function(req, res) {
  res.json({message: 'Express up'});
});

app.post('/login', function(req, res) {
  if(req.body.name && req.body.password) {
    var name = req.body.name;
    var password = req.body.password;
  }
  //usually a databse call:
  var user = users[_.findIndex(users, {name: name})];
  if(!user) {
    res.status(401).json({message: "no such user"});
  }

  if(user.password === req.body.password) {
    var payload = {id: user.id};
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: "ok", token: token});
  } else {
    res.status(401).json({message: "password did not match"});
  }
});

app.get('/secret', passport.authenticate('jwt', {session: false}), function(req, res) {
  res.json({message: "success you can't see this without token"});
});

app.get('/debug', function(req, res, next) {
  console.log(req.get('Authorization'));
  next();
}, function(req, res) {
  res.json('debugging');
});

app.listen(3000, function() {
  console.log('listening on 3000');
});