(function(){
  'use strict';

  angular
    .module('devicefarmApp')
    .service('Device', Device);

  function Device($http){


    this.getAll = function(){

      return $http.get('/api/devices/all');

    };

    this.get = function(){

      return $http.get('/api/devices');

    };

    this.getDevices = function(id){

      return $http.get('/api/devices/' + id);

    };


    this.delete = function(id){
      return $http.delete('/api/clients/' + id);
    };

    this.save = function(id, data){

      return $http.put('/api/devices/' + id, data);

    };

  }


})();