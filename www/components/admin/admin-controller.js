(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$mdSidenav', 'device', '$location'];

    function AdminController($scope, $mdSidenav, device, $location) {

        var vm = this;
        vm.imagesPath = device.getImagesPath();
        vm.viewMode = 'ordersManager';

        vm.showSideNav = $location.search().s !== undefined ? false : true;

        vm.toggleSidenav = function (menuId) {
            $mdSidenav(menuId).toggle();
        };

        vm.closeSidenav = function () {
            $mdSidenav("left").close();
        };

        vm.menu = [{
            headerText: 'הזמנות',
            defultOpen: true,
            buttons: [{
                text: 'ניהול הזמנות',
                mode: '',
                icon: ''
            }, {
                text: 'מצב הזמנה',
                mode: 'ordersStatus',
                icon: 'timeline'
            }, {
                text: 'דוחות הזמנה',
                mode: 'ordersManager',
                icon: 'view_quilt'
            }]
        },{
            headerText: 'תעודות',
            defultOpen: false
            
        },{
            headerText: 'ספירות מלאי',
            defultOpen: false
        },{
            headerText: 'סניפים',
            defultOpen: true,
            buttons: [{
                text: 'ניהול סניפים',
                mode: 'usersManager',
                icon: 'people_outline'
            }]
        },{
            headerText: 'ספקים',
            defultOpen: false
        },{
            headerText: 'קטלוג',
            defultOpen: false
        }];
    }

})();