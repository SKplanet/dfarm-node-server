(function(){

  'use strict';
  angular
    .module('devicefarmApp')
    .controller('DeviceListCtrl', DeviceCtrl);

  function DeviceCtrl($scope, Device, socket) {

    Device.getAll().success(function(devices) {
      $scope.devices = devices;

      socket.syncUpdates('device', [], function(message, data){

        var i;
        for(i=$scope.devices.length-1; -1<i ; --i){

          if( $scope.devices[i]._id === data._id ){
            $scope.devices[i] = data;
            break;
          }
        }

      });
    });  


    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('device');
    });

  }


})();

