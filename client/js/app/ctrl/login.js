/* global angular */
angular.module('app').controller('loginCtrl',
  function ($rootScope, $scope, $state, user, alerts) {
    'use strict';

    onUser(function () {
      $state.transitionTo('index');
    });

    $scope.login = function (name, pass) {
      user.login(name, pass, function (err) {
        if (err) alerts.create('error', err);

        $state.transitionTo('index');
      });
    };

    function onUser(cb) {
      if (user.data) return cb();
      $rootScope.$on('logged-in', function (e, isLoggedIn) {
        if (isLoggedIn) cb();
      });
    }

    $scope.alerts = alerts.alerts;
    $scope.closeAlert = alerts.close;
  }
);
