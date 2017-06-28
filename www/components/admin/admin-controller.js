(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$mdSidenav', 'device', '$routeParams' ];

    function AdminController($scope,  $mdSidenav, device, $routeParams) {

        var vm = this;
        vm.imagesPath = device.getImagesPath();
        vm.viewMode = 'ordersStatus';
        
        vm.showSideNav = $routeParams.s;

        vm.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        vm.closeSidenav = function () {
                $mdSidenav("left").close();
            };
    }

})();