'use strict';

angular.module('devicefarmApp')
.controller('DeviceDetailCtrl', function ($scope, $http, $location, $modal, $log, socket) {

  var id = $location.path().replace('/devices/','');

  $scope.isEditManagerName = false;
  $scope.isEditManagerTeam = false;

  $scope.findDeviceSerial = function(item){

    console.log(item.deviceId , $scope.device.serial, item.deviceId == $scope.device.serial)

    return (item.deviceId == $scope.device.serial);
  }

  $http.get('/api/devices/' + id).success(function(device) {
    $scope.device = device;

    $http.get('/api/devicelogs/'+ device.serial, {params:{lastest:10}}).success(function(logs) {
      $scope.logs = logs;
      console.log('logs', logs);
      socket.syncUpdates('devicelog', $scope.logs, function(message, data){
        console.log('devicelog: ', message, data);
      })
    });

  });

  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('devicelog');
  });

  $scope.save = function(){

    $http.put('/api/devices/' + id, $scope.device).success(function(){
      $scope.isEditManagerName = false;
      $scope.isEditManagerTeam = false;
    });
  };


  $scope.editManagerName = function(){
    $scope.isEditManagerName = true;
  }

  $scope.editManagerTeam = function(){
    $scope.isEditManagerTeam = true;
  }

  $scope.openPhotoUrlEditor = function(size){

    var modalInstance = $modal.open({
      templateUrl: 'photoUrlEditModal',
      controller: function ($scope, $modalInstance, device) {

        $scope.device = device;

        $scope.ok = function () {
          console.log($scope, device);

          $http.put('/api/devices/' + id, $scope.device).success(function(){
            $modalInstance.close($scope);
          });
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      },
      size: size,
      resolve: {
        device: function () {
          return $scope.device;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;


    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.openTagEditor = function(size){

    var modalInstance = $modal.open({
      templateUrl: 'tagEditModal',
      controller: function ($scope, $modalInstance, device, tagText) {

        $scope.device = device;
        $scope.tagText = tagText

        $scope.ok = function () {
          var tags = this.tagText.split(',');

          tags.forEach(function(s, i){
            tags[i] = s.replace(/^\s+|\s+$/g, '')
          });

          $scope.device.tags = tags;

          console.log($scope.device.tags);

          $http.put('/api/devices/' + id, $scope.device).success(function(){
            $modalInstance.close($scope);
          });
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      },
      size: size,
      resolve: {
        device: function () {
          return $scope.device;
        },
        tagText: function(){
          return $scope.device.tags.join(", ");
        }
      }
    });

    modalInstance.result.then(function () {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  
});
