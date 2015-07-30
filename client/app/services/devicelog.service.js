(function(){
  'use strict';

  angular
    .module('devicefarmApp')
    .service('DeviceLog', DeviceLog)

  function DeviceLog($http){

    this.getLogs = function(serial){
      return $http.get('/api/devicelogs/'+ serial, {params:{lastest:20}}) ;
    };

  }

})();