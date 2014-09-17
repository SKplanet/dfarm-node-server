'use strict';

describe('Controller: StateCtrl', function () {

  // load the controller's module
  beforeEach(module('devicefarmApp'));

  var StateCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StateCtrl = $controller('StateCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
