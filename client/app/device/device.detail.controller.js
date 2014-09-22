'use strict';

angular.module('devicefarmApp')
.controller('DeviceDetailCtrl', function ($scope, $http, $location) {

  console.log($location.path());

  $http.get('/api/devices/').success(function(devices) {
    $scope.devices = devices;
    console.log(devices);
  });

  
});
