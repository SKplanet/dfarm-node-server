'use strict';

angular.module('devicefarmApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $http.get('/api/devices').success(function(devices) {
      $scope.devices = devices;
      socket.syncUpdates('device', $scope.devices);
    });

    $scope.deleteDevice = function(thing) {
      $http.delete('/api/devices/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('device');
    });
  });