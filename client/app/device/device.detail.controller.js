'use strict';

angular.module('devicefarmApp')
.controller('DeviceDetailCtrl', function ($scope, $http, $location, $modal, $log) {

  var id = $location.path().replace('/devices/','');
  $scope.isEditManagerName = false;
  $scope.isEditManagerTeam = false;
  

  $http.get('/api/devices/' + id).success(function(device) {
    $scope.device = device;
    console.log(device);
  });

  $scope.editManagerName = function(){
    $scope.isEditManagerName = true;

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

  }
  
});
