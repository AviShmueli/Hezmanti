(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = [
        '$rootScope', '$scope', 'server', '$state',
        '$mdSidenav', '$mdComponentRegistry', '$log',
        'dataContext', '$timeout', 'device'
    ];

    function AdminController(
        $rootScope, $scope, server, $state,
        $mdSidenav, $mdComponentRegistry, $log,
        dataContext, $timeout, device) {

        var vm = this;
        vm.imagesPath = device.getImagesPath();
        vm.viewMode = 'ordersManager';
        
        vm.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        vm.closeSidenav = function () {
                $mdSidenav("left").close();
            };
    }

})();