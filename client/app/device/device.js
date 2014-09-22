'use strict';

angular.module('devicefarmApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('device', {
        url: '/devices',
        templateUrl: 'app/device/device.html',
        controller: 'DeviceCtrl'
      })
      .state('device/detail', {
        url: '/devices/:id',
        templateUrl: 'app/device/device.detail.html',
        controller: 'DeviceDetailCtrl'
      });
  });