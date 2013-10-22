/* jshint node:true */
'use strict';

var request = require('request'),
          _ = require('underscore'),
     config = require('config');

var rc = config.refresh;
var cc = config.couch;
var couchUrl = 'http://' + cc.host + ':' + cc.port + '/' + cc.db.subdomains;

var needsRefreshed = false;

module.exports = function (app) {
  app.get('/subdomains',
    app.mw.loggedIn,
    app.mw.hasACL('subdomains'),
    getSubs
  );

  app.get('/domains',
    app.mw.loggedIn,
    app.mw.hasACL('subdomains'),
    getDomains
  );

  app.post('/subdomain',
    app.mw.loggedIn,
    app.mw.hasACL('subdomains'),
    addSub
  );

  app.delete('/subdomain/:id/:rev',
    app.mw.loggedIn,
    app.mw.hasACL('subdomains'),
    deleteSub
  );

  app.get('/refresh',
    app.mw.loggedIn,
    app.mw.hasACL('refresh'),
    refreshDomains
  );

  app.get('/needsRefreshed',
    app.mw.loggedIn,
    app.mw.hasACL('refresh'),
    getNeedsRefreshed
  );
};

function getSubs(req, res) {
  _getSubDomains(function (err, data) {
    if (err) return _fail(res, err);

    res.send({
      success: true,
      subs: data
    });
  });
}


function getDomains(req, res) {
  _getDomains(function (err, body) {
    if (err) return _fail(res, err);

    var domains = _.map(body.rows, function (row) {
      return row.value.domain;
    });
    domains = _.uniq(domains);

    res.send({
      success: true,
      domains: domains
    });
  });
}


function addSub(req, res) {
  var b = req.body;
  var obj = {
    domain: b.domain,
    host: b.host,
    sub: b.sub
  };

  request(couchUrl + '/' + b._id, function (err, resp, data) {
    if (err) return _fail(res, err);

    data = JSON.parse(data);

    var _url = couchUrl;
    var _method = 'POST';
    if (!data.error && b._id) {
      obj._id = data._id;
      obj._rev = data._rev;

      _url = couchUrl + '/' + b._id;
      _method = 'PUT';
    }

    request({
      url: _url,
      json: obj,
      method: _method
    }, function (err, resp, data) {
      if (err) return _fail(res, err);
      if (data.error) return _fail(res, data);

      needsRefreshed = true;

      res.send({
        success: true,
        meta: {
          _id: data.id,
          _rev: data.rev
        }
      });
    });
  });
}


function deleteSub(req, res) {
  var id = req.params.id;
  var rev = req.params.rev;

  request({
    url: couchUrl + id + '?rev=' + rev,
    method: 'DELETE'
  }, function (err, resp, data) {
    if (err) return _fail(res, err);
    if (data.error) return _fail(res, data);

    needsRefreshed = true;

    res.send({
      success: true
    });
  });
}


function refreshDomains(req, res) {
  var url = 'http://refresh.' + rc.host + '?token=' + rc.token;
  request(url, function (err, resp, body) {
    if (err) return _fail(res, err);

    body = JSON.parse(body);

    if (!body.success) return _fail(res, body.err);

    needsRefreshed = false;

    res.send({
      success: true,
      status: 'Refreshed'
    });
  });
}

function getNeedsRefreshed(req, res) {
  res.send({
    success: true,
    status: needsRefreshed
  });
}


function _getDomains(cb) {
  request(couchUrl + '/_design/_view/_view/getDomain',
    function (err, resp, body) {
      if (err) return cb(err);
      body = JSON.parse(body);
      if (body.error) return cb(body.error);

      cb(null, body);
    }
  );
}


function _getSubDomains(cb) {
  _getDomains(function (err, body) {
    if (err) return cb(err);

    var obj = {};
    _.each(body.rows, function (row) {
      var v = row.value;
      obj[v.domain] = obj[v.domain] || [];
      obj[v.domain].push(v);
    });

    cb(null, obj);
  });
}


function _fail(res, err) {
  res.send({
    success: false,
    err: err
  });
}
