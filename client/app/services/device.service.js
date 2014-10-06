(function(){

  function DeviceService($http){

    this.getDevices = function(id){

      return $http.get('/api/devices/' + id);

    };


    this.disconnect = function(id){

      return $http.delete('/api/clients/kickout/' + id, {jobid:''}).success(function(data) { 

        console.log(data);

      });
    }

    this.save = function(id, data){

      return $http.put('/api/devices/' + id, data);

    };

  }

  angular.module('devicefarmApp')
  .service('DeviceService', DeviceService)

})();