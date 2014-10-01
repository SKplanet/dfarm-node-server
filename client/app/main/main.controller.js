'use strict';

angular.module('devicefarmApp')
  .controller('MainCtrl', function ($scope, $http, socket) {

    $http.get('/api/devices').success(function(devices) {
      $scope.devices = devices;
      console.log(devices);
      socket.syncUpdates('device', $scope.devices);
    });

    $http.get('/api/clients').success(function(clients){

      $scope.clients = clients;

      console.log('clients', clients);
      socket.syncUpdates('client', $scope.clients, function(message, data){
        console.log('clients: ', message, data);
      });
      
    })
    
    $scope.findWaitingClients = function(item) {
      return (item.state !== 'processing' );
    };

    $scope.deleteDevice = function(device) {
      $http.delete('/api/devices/' + device._id);
    };

    $scope.deleteClient = function(client){
      $http.delete('/api/clients/' + client._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('device');
      socket.unsyncUpdates('client');
    });
  });