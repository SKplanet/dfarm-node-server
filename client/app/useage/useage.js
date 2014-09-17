'use strict';

angular.module('devicefarmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('useage', {
        url: '/useage',
        templateUrl: 'app/useage/useage.html',
        controller: 'StateCtrl'
      });
  });