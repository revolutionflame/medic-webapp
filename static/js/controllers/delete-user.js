var modal = require('../modules/modal');

(function () {

  'use strict';

  var inboxControllers = angular.module('inboxControllers');

  inboxControllers.controller('DeleteUserCtrl',
    function (
      $rootScope,
      $scope,
      $translate,
      DeleteUser
    ) {

      'ngInject';

      $scope.$on('DeleteUserInit', function(e, user) {
        $scope.deleteUser = user;
      });

      $scope.deleteUserConfirm = function() {
        var pane = modal.start($('#delete-user-confirm'));
        DeleteUser($scope.deleteUser, function(err) {
          if (err) {
            $translate('Error deleting document').then(function(message) {
              pane.done(message, err);
            });
            return;
          }
          $scope.deleteUser = null;
          $rootScope.$broadcast('UsersUpdated');
          pane.done();
        });
      };

    }
  );

}());