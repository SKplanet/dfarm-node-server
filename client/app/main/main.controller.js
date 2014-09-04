'use strict';

angular.module('devicefarmApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $http.get('/api/devices').success(function(devices) {
      $scope.devices = devices;
      socket.syncUpdates('device', $scope.devices);
    });

    
    
    $http.get('/api/clients').success(function(clients){

      $scope.clients = clients;
      socket.syncUpdates('client', $scope.clients, function(){
        console.log('clients: ', $scope.clients);
      });
      
    })
    

    $scope.deleteDevice = function(thing) {
      $http.delete('/api/devices/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('device');
      socket.unsyncUpdates('client');
    });
  });