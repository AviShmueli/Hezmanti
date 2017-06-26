(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = [
        '$rootScope', '$scope', 'server', '$state',
        '$mdSidenav', '$mdComponentRegistry', '$log',
        'dataContext', '$timeout', 'socket', 'device'
    ];

    function AdminController(
        $rootScope, $scope, server, $state,
        $mdSidenav, $mdComponentRegistry, $log,
        dataContext, $timeout, socket, device) {

        var vm = this;
        vm.imagesPath = device.getImagesPath();
        vm.viewMode = 'usersManager';
        
        vm.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        vm.closeSidenav = function () {
                $mdSidenav("left").close();
            };
    }

})();