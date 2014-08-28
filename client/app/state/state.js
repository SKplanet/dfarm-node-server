'use strict';

angular.module('devicefarmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('state', {
        url: '/state',
        templateUrl: 'app/state/state.html',
        controller: 'StateCtrl'
      });
  });