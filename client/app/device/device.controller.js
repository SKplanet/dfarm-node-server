'use strict';

angular.module('devicefarmApp')
.controller('DeviceCtrl', function ($scope, $http, $location) {

  $http.get('/api/devices').success(function(devices) {
    $scope.devices = devices;


    console.log(devices);


  });  


  $scope.go = function(id){
    $location.path("/devices/" + id);
  }

});
