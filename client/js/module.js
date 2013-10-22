/* global angular, mNav */
angular.module('app', ['ui.bootstrap', 'ui.router']).config(
  function ($stateProvider, $urlRouterProvider) {
    'use strict';

    for (var i = 0; i < mNav.length; ++i) {
      $stateProvider.state(mNav[i].state, {
        templateUrl: mNav[i].tmpl,
        controller: mNav[i].ctrl,
        name: mNav[i].label,
        url: mNav[i].url,
        acl: mNav[i].acl
      });
    }

    $urlRouterProvider.otherwise('/');
  }
);
