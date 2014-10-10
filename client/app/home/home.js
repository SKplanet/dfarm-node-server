(function(){
  'use strict';

  angular
    .module('devicefarmApp')
    .controller('HomeCtrl', HomeCtrl);

  function HomeCtrl($scope, Device, Client, socket) {

    Device.get().success(function(devices) {
      $scope.devices = devices;
      socket.syncUpdates('device', $scope.devices);
    });

    Client.get().success(function(clients){

      $scope.clients = clients;
      socket.syncUpdates('client', $scope.clients);
      
    })
    
    $scope.findWaitingClients = function(item) {
      return (item.state === 'waiting' );
    };

    $scope.deleteDevice = function(device) {
      Client.delete(device._id);
    };

    $scope.deleteClient = function(client){
      Client.delete(client._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('device');
      socket.unsyncUpdates('client');
    });
  }


})();