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

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $rootScope.user = Auth.getCurrentUser();

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
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