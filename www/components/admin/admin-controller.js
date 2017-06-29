(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$mdSidenav', 'device' , '$location'];

    function AdminController($scope,  $mdSidenav, device, $location) {

        var vm = this;
        vm.imagesPath = device.getImagesPath();
        vm.viewMode = 'ordersStatus';
        
        vm.showSideNav = $location.search().s !== undefined ? false : true; 

        vm.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        vm.closeSidenav = function () {
                $mdSidenav("left").close();
        };
    }

})();