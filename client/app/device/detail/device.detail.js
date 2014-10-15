(function () {
  'use strict';

  angular
    .module('devicefarmApp')
    .controller('DeviceDetailCtrl', DeviceDetailCtrl);


  function DeviceDetailCtrl($scope, $location, $modal, $log, $timeout, Device, DeviceLog, Client, socket, $interval) {

    var id = $location.path().replace('/devices/',''), timer = null;
    var _this = this;

    $scope.isEditManagerName = false;
    $scope.isEditManagerTeam = false;

    Device
      .getDevices(id)
      .success(function(device){

        $scope.device = device;

        _this.resetTimer(device.connectedAt);

        socket.syncUpdates('device', [], function(message, data){

          if( $scope.device._id === data._id ){
            $scope.device = data;
            _this.resetTimer(data.connectedAt);
            
          }
          
        });

        DeviceLog
          .getLogs(device.serial)
          .success(function(logs){
            $scope.logs = logs;
            socket.syncUpdates('devicelog', [], function(message, data){

              if( $scope.device.serial ==  data.deviceId){
                $scope.logs.push(data);
              }

            });
          });
      });
    

    this.resetTimer = function(dateAt){

      if(timer){
        $interval.cancel(timer);
        timer = null;
      }

      if( dateAt ){

        $scope.spendTime = moment().preciseDiff( dateAt );

        timer = $interval(function(){

          $scope.spendTime = moment().preciseDiff( dateAt );

        }, 1000);
      }

    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('devicelog');
    });


    $scope.disconnetDevice = function(){
      Client.disconnect(id);
    };

    $scope.keypress = function($event) {
      if ( $event.keyCode === 13 ){
        Device
        .save(id, $scope.device)
        .success(function(){
          $scope.isEditManagerName = false;
          $scope.isEditManagerTeam = false;
        });
      }
    };

    $scope.editManagerName = function(){
      $scope.isEditManagerName = true;
      $timeout(function(){
        angular.element("#editName")[0].focus();
      },100);
    }

    $scope.editManagerTeam = function(){
      $scope.isEditManagerTeam = true;
      $timeout(function(){
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

            Device
              .save(id, $scope.device)
              .success(function(){
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

            Device
              .save(id, $scope.device)
              .success(function(){
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
    
  }

})();