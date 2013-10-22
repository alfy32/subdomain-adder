/* global angular */
angular.module('app').factory('subs',
  function ($http) {
    'use strict';

    function getSubdomains(cb) {
      _simplifiedHttp('/subdomains', 'get', cb);
    }

    function getDomains(cb) {
      _simplifiedHttp('/domains', 'get', cb);
    }

    function updateSubdomain(obj, cb) {
      _simplifiedHttp('/subdomain', 'post', cb, obj);
    }

    function deleteSubdomain(obj, cb) {
      var url = '/subdomain/' + obj._id + '/' + obj._rev;
      _simplifiedHttp(url, 'delete', cb);
    }

    function refresh(cb) {
      $http.get('/refresh').then(function (resp) {
        cb(resp.data);
      });
    }

    function getNeedsRefreshed(cb) {
      $http.get('/needsRefreshed').then(function (resp) {
        if (!resp.data.success) return cb(false);
        cb(resp.data.status);
      });
    }

    function _simplifiedHttp(url, method, cb, obj) {
      $http[method](url, obj).then(
        function (resp) {
          if (!resp.data.success) return cb(resp.data.err);

          cb(null, resp.data);
        }, function (err) {
          cb(err);
        }
      );
    }

    return {
      getSubdomains: getSubdomains,
      getDomains: getDomains,
      updateSubdomain: updateSubdomain,
      deleteSubdomain: deleteSubdomain,
      getNeedsRefreshed: getNeedsRefreshed,
      refresh: refresh
    };
  }
);
