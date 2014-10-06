(function(){

  function DeviceLogService($http){

    this.getLogs = function(serial){
      return $http.get('/api/devicelogs/'+ serial, {params:{lastest:20}}) ;
    };

  }

  angular.module('devicefarmApp')
  .service('DeviceLogService', DeviceLogService)

})();