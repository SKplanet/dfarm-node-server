(function(){

  'use strict';

  function DeviceCtrl($scope, $http, $location) {

    $http.get('/api/devices/all').success(function(devices) {
      $scope.devices = devices;
    });  

    $scope.go = function(id){
      $location.path("/devices/" + id);
    }
  }

  angular.module('devicefarmApp')
    .controller('DeviceCtrl', DeviceCtrl);

})();

