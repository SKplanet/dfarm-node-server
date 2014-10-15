(function(){

  'use strict';

  angular
    .module('devicefarmApp')
    .config(route);

  function route($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'
      })
      .state('device', {
        url: '/devices',
        templateUrl: 'app/device/list/device.list.html',
        controller: 'DeviceListCtrl'
      })
      .state('device-detail', {
        url: '^/devices/:id',
        templateUrl: 'app/device/detail/device.detail.html',
        controller: 'DeviceDetailCtrl'
      })
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });

  }

})();
