(function(){

  'use strict';

  angular
    .module('devicefarmApp')
    .config(route);

  function route($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl'
      });
  }

})();
