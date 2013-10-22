/* global angular */
angular.module('app').factory('alerts',
  function ($timeout) {
    'use strict';

    var alerts = [];

    function create(type, msg) {
      var alert = {
        type: type,
        msg: msg
      };

      alert.timeout = $timeout(
        function () {
          var index = alerts.indexOf(alert);
          close(index);
        }, 4000
      );

      alerts.push(alert);
    }

    function close(index, alert) {
      alerts.splice(index, 1);
      if (alert) {
        $timeout.cancel(alert.timeout);
      }
    }

    return {
      alerts: alerts,
      create: create,
      close: close
    };
  }
);
