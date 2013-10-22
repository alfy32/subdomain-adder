/* jshint node: true*/
'use strict';

var       config = require('config'),
         request = require('request'),
    passwordHash = require('password-hash');

var cc = config.couch;
var couchUrl = 'http://' + cc.host + ':' + cc.port + '/' + cc.db.users;

module.exports = function (app) {
  app.post('/login', login);
  app.get('/logout', logout);
  app.get('/user', app.mw.loggedIn, user);
};

function login(req, res) {
  var name = req.body.name;
  var pass = req.body.pass;

  if (!name || !pass) {
    return _fail(res, 'Missing Username or Password.');
  }

  request(couchUrl + '/' + name, function (err, resp, body) {
    if (err) return _fail(res, err);

    body = JSON.parse(body);

    if (body.error) {
      return _fail(res, 'Incorrect Username or Password');
    }

    if (passwordHash.verify(pass, body.pass)) {
      body.name = body._id;

      delete body._rev;
      delete body._id;
      delete body.pass;

      req.session.user = body;
      res.send({
        success: true,
        user: body
      });
    } else {
      _fail(res, 'Incorrect Username or Password');
    }
  });
}

function logout(req, res) {
  req.session.destroy(function () {
    res.send('ok');
  });
}

function user(req, res) {
  res.send({
    success: true,
    user: req.session.user
  });
}

function _fail(res, err) {
  res.send({
    success: false,
    err: err
  });
}
