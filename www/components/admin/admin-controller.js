(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['$scope', '$mdSidenav', 'device', '$location',
        'server', 'dataContext', '$state', 'lodash'
    ];

    function AdminController($scope, $mdSidenav, device, $location,
        server, dataContext, $state, _) {

        var vm = this;

        vm.viewMode = $state.params.mode || 'ordersDistribution';
        vm.stateIdParam = $state.params.id;
        vm.refreshDataFromServer = 0;
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
            defultOpen: false,
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
        }, {
            headerText: 'תעודות',
            defultOpen: false

        }, {
            headerText: 'ספירות מלאי',
            defultOpen: false,
            buttons: [{
                text: 'ניהול מלאי',
                mode: 'stockManager',
                icon: 'line_style'
            }]
        }, {
            headerText: 'סניפים',
            defultOpen: false,
            buttons: [{
                text: 'ניהול סניפים',
                mode: 'usersManager',
                icon: 'people_outline'
            }]
        }, {
            headerText: 'ספקים',
            defultOpen: false,
            buttons: [{
                text: 'ספקים',
                mode: 'suppliersManager',
                icon: 'view_module'
            }]
        }, {
            headerText: 'קטלוג',
            defultOpen: false,
            buttons: [{
                text: 'מחלקות',
                mode: 'departmentsManager',
                icon: 'view_module'
            }]
        }];

        vm.menuItem = _.find(vm.menu, function (menuItem) {
            if (menuItem.buttons) {
                var isExcist = _.findIndex(menuItem.buttons, function (button) {
                    if (button.mode === vm.viewMode) {
                        vm.subMenuText = button.text;
                        return true;
                    }
                    return false;
                });
                if (isExcist !== -1) {
                    return true;
                }
            }
            return false;
        });

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