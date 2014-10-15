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
      socket.syncUpdates('client', $scope.clients, function(message, data){
      
        for(var i=0, len = $scope.clients.length; i < len; ++i){

          if( $scope.clients[i].state !== 'waiting' ){
            $scope.clients.splice(i, 1);
            break;
          }
        }

      });
      
    })
    
    $scope.findWaitingClients = function(item) {
      return (item.state === 'waiting' );
    };

    $scope.deleteDevice = function(device) {
      Device.delete(device._id);
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