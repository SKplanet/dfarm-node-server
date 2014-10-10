(function(){

  'use strict';
  angular
    .module('devicefarmApp')
    .controller('DeviceListCtrl', DeviceCtrl);

  function DeviceCtrl($scope, Device) {

    Device.getAll().success(function(devices) {
      $scope.devices = devices;
    });  

  }


})();

