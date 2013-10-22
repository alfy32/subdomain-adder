/* global angular */
angular.module('app').controller('mainCtrl',
  function ($scope, subs, user, alerts) {
    'use strict';

    subs.getSubdomains(function (err, data) {
      if (err) return alerts.create('error', err);
      $scope.subs = data.subs;
    });

    subs.getDomains(function (err, data) {
      if (err) return alerts.create('error', err);
      $scope.domains = data.domains;
    });

    subs.getNeedsRefreshed(function (needsIt) {
      $scope.needsRefreshed = needsIt;
    });

    $scope.modalOpts = {
      backdropFade: true,
      dialogFade: true
    };

    $scope.showModal = false;

    $scope.openModal = function (type, obj, index) {
      obj = obj || {};
      $scope.mTitle = type;

      $scope.obj = {
        _id: obj._id,
        _rev: obj._rev,
        domain: obj.domain || $scope.domains[0],
        sub: obj.sub,
        host: obj.host
      };

      if (typeof index !== 'undefined') {
        $scope.obj.index = index;
      }

      $scope.showModal = true;
    };

    $scope.closeModal = function () {
      $scope.showModal = false;
    };

    $scope.updateSubdomain = function (obj, isUpdate) {
      var index;
      if (isUpdate) {
        index = obj.index;
        delete obj.index;
      }

      subs.updateSubdomain(obj, function (err, data) {
        if (err) return alerts.create('error', err);
        obj._id = data.meta._id;
        obj._rev = data.meta._rev;

        $scope.needsRefreshed = true;

        if (isUpdate) {
          $scope.subs[obj.domain][index] = obj;
        } else {
          $scope.subs[obj.domain].push(obj);
        }
      });
      $scope.showModal = false;
    };

    $scope.deleteSubdomain = function (obj, index) {
      subs.deleteSubdomain(obj, function (err) {
        if (err) return alerts.create('error', err);
        $scope.needsRefreshed = true;
        $scope.subs[obj.domain].splice(index, 1);
      });
    };

    $scope.refresh = function () {
      subs.refresh(function (data) {
        if (!data.success) return alerts.create('error', data.err);
        $scope.needsRefreshed = false;
        alerts.create('info', data.status);
      });
    };

    $scope.canRefresh = function () {
      return user.hasACL('refresh');
    };

    $scope.logout = user.logout;
    $scope.alerts = alerts.alerts;
    $scope.closeAlert = alerts.close;
  }
);
