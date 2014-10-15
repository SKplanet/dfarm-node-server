'use strict';

angular.module('devicefarmApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    },{
      'title': 'Device',
      'link' : '/devices'
    }];

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
      $rootScope.isLoggedIn = false;
      $rootScope.isAdmin = false;
    };

    $scope.isActive = function(route) {

      var path = $location.path().split('/');

      if( path.length < 3){

        return route === $location.path();

      }else{

        return route === "/"+path[1];

      }
      
    };
  });