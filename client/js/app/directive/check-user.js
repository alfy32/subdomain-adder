/* global angular */
angular.module('app').directive('checkUser',
  function ($rootScope, $state, user) {
    'use strict';

    return function () {
      $rootScope.$on('$stateChangeStart', function (e, to) {
        if (!user.data && to.acl) {
          e.preventDefault();
          var deregister = $rootScope.$on('logged-in', function (e, isLoggedIn) {
            deregister();
            if (isLoggedIn) {
              $state.transitionTo(to.name);
            } else {
              $state.transitionTo('login');
            }
          });
          return;
        }

        if (to.acl) {
          if (!user.hasACL(to.acl)) {
            e.preventDefault();
            $state.transitionTo('login');
            return;
          }
        }
      });

      user.check();
    };
  }
);

