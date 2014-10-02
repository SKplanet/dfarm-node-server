'use strict';

angular.module('devicefarmApp')
.controller('DeviceDetailCtrl', function ($scope, $http, $location, $modal, $log, socket) {

  var id = $location.path().replace('/devices/','');

  $scope.isEditManagerName = false;
  $scope.isEditManagerTeam = false;

  $scope.findDeviceSerial = function(item){

    return (item.deviceId == $scope.device.serial);
  }

  $http.get('/api/devices/' + id).success(function(device) {
    $scope.device = device;
    socket.syncUpdates('device', [$scope.device], function(message, data){
      $scope.device = data;
    });

    $http.get('/api/devicelogs/'+ device.serial, {params:{lastest:20}}).success(function(logs) {
      $scope.logs = logs;
      socket.syncUpdates('devicelog', $scope.logs);
    });

  });

  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('devicelog');
  });


  $scope.disconnetDevice = function(){
    $http.delete('/api/clients/kickout/' + id, {jobid:''}).success(function(data) { 

      console.log(data);

    });
  };

  $scope.save = function(){

    $http.put('/api/devices/' + id, $scope.device).success(function(){
      $scope.isEditManagerName = false;
      $scope.isEditManagerTeam = false;
    });
  };

  $scope.keypress = function($event) {
    if ( $event.keyCode === 13 ){
      this.save();
    }
  };

  $scope.editManagerName = function(){
    $scope.isEditManagerName = true;
    setTimeout(function(){
      angular.element("#editName")[0].focus();
    },100);
  }

  $scope.editManagerTeam = function(){
    $scope.isEditManagerTeam = true;
    setTimeout(function(){
      angular.element("#editTeam")[0].focus();
    }, 100);
    
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

    modalInstance.result.then(function () {}, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  
});
