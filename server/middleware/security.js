/* jshint node:true */
'use strict';

var _ = require('underscore');

module.exports = function (app) {
  app.mw.loggedIn = loggedIn;
  app.mw.hasACL = hasACL;
};

function loggedIn(req, res, next) {
  if (req.session.user) return next();

  res.send({
    success: false,
    err: 'Not Logged In'
  });
}

function hasACL(permission) {
  return function (req, res, next) {
    var user = req.session.user;
    if (user && _.isArray(user.acl)) {
      if (_.contains(user.acl, permission)) {
        return next();
      }
    }

    res.send({
      success: false,
      err: 'Insufficient Privileges'
    });
  };
}
