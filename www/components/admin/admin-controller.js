(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$mdSidenav', 'device', '$location',
                               'server', 'dataContext'];

    function AdminController($scope, $mdSidenav, device, $location,
                             server, dataContext) {

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

        //* ---- Preper Data ------ */
        var catalog = dataContext.getCatalog();

        if (!catalog) {
            server.getCatalog().then(function (response) {
                vm.items = response.data;
                var departmentsMap = {};
                for (var index = 0; index < response.data.length; index++) {
                    var item = response.data[index];
                    if (!departmentsMap.hasOwnProperty(item.departmentId)) {
                        departmentsMap[item.departmentId] = [];
                    }
                    departmentsMap[item.departmentId].push(item);
                }
                dataContext.setCatalog(departmentsMap);
            });
        }
    }

})();