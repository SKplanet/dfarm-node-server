(function(){
  'use strict';

  angular
    .module('devicefarmApp')
    .config(route);

  function route ($stateProvider) {
    $stateProvider
      .state('device', {
        url: '/devices',
        templateUrl: 'app/device/list/device.list.html',
        controller: 'DeviceListCtrl'
      })
      .state('device-detail', {
        url: '^/devices/:id',
        templateUrl: 'app/device/detail/device.detail.html',
        controller: 'DeviceDetailCtrl'
      });
  }

})();