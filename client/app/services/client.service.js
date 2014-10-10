(function(){
  'use strict';

  angular
    .module('devicefarmApp')
    .service('Client', Client);

  function Client($http){


    this.get = function(){

      return $http.get('/api/clients');

    };

    this.getClient = function(id){

      return $http.get('/api/clients/' + id);

    };

    this.delete = function(id){
      return $http.delete('/api/clients/' + id);
    };

    this.disconnect = function(id){

      return $http.delete('/api/clients/kickout/' + id, {jobid:''}).success(function(data) { 

        console.log(data);

      });
    }

  }

})();