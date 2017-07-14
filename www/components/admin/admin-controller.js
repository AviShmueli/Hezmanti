(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$mdSidenav', 'device', '$location',
                               'server', 'dataContext', '$state'];

    function AdminController($scope, $mdSidenav, device, $location,
                             server, dataContext,  $state) {

        var vm = this;

        vm.viewMode = $state.params.mode || 'ordersDistribution';

        vm.imagesPath = device.getImagesPath();
        vm.loadingData = false;

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
                text: 'חלוקת הזמנות לספקים',
                mode: 'ordersDistribution',
                icon: 'blur_linear'
            }, {
                text: 'מצב הזמנה',
                mode: 'ordersStatus',
                icon: 'timeline'
            }, {
                text: 'הזמנות',
                mode: 'ordersManager',
                icon: 'view_quilt'
            }]
        },{
            headerText: 'תעודות',
            defultOpen: false
            
        },{
            headerText: 'ספירות מלאי',
            defultOpen: true,
            buttons: [{
                text: 'ניהול מלאי',
                mode: 'stockManager',
                icon: 'line_style'
            }]
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
            vm.loadingData = true;
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
                vm.loadingData = false;
            });
        }
    }

})();