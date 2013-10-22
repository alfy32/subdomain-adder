/* global angular, _ */
'use strict';

angular.module('app').factory('user',
  function ($rootScope, $http, $window) {
    function User() {
      var user = this;

      this.hasACL = function (permission) {
        if ('data' in user) {
          if (_.isArray(user.data.acl)) {
            return _.contains(user.data.acl, permission);
          }
        }
        return false;
      };

      this.check = function () {
        $http.get('/user').then(function (resp) {
          if (resp.data.success) {
            user.data = resp.data.user;
            $rootScope.$emit('logged-in', true);
          } else {
            $rootScope.$emit('logged-in', false);
          }
        });
      };

      this.login = function (name, pass, cb) {
        var data = {
          name: name,
          pass: pass,
        };

        $http.post('/login', data).then(function (resp) {
          if (resp.data.success) {
            user.data = resp.data.user;
            $rootScope.$emit('logged-in', true);
            cb(null);
          } else {
            $rootScope.$emit('logged-in', false);
            cb(resp.data.err);
          }
        });
      };

      this.logout = function () {
          $http.get('/logout').then(function () {
            $window.location.reload();
          });
      };
    }
    return new User();
  }
);
