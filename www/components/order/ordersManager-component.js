(function () {
    'use strict';

    angular
        .module('app')
        .component('ordersManager', {
            bindings: {
                client: '=',
            },
            controller: ordersManagerController,
            controllerAs: 'vm',
            templateUrl: 'components/order/ordersManager-template.html'
        });

    function ordersManagerController(server, $q, filesHandler, $filter, $mdDialog, $timeout, dataContext) {

        var vm = this;

        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';
        vm.toggleFilterSection = function () {
            if (vm.showTasksFilter === true) {
                vm.showTasksFilter = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showTasksFilter = true;
                vm.expand_icon = 'expand_less';
            }
        }

        vm.downloadExel = function (orderId) {
            server.getOrder(orderId).then(function (response) {
                var order = response.data;
                var orderFields = {
                    createdDate: 'ת. הזמנה',
                    deliveryDate: 'ת. אספקה',
                    branchId: 'מחסן',
                    itemSerialNumber: 'פריט/ברקוד',
                    count: 'מארזים'
                };
                var fileName = order.branchId + '_' + $filter('date')(order.createdDate, 'dd/MM/yyyy');

                var orderItemsList = createOrderItemsList(order);
                filesHandler.downloadOrderAsCSV(orderItemsList, orderFields, fileName);
            });
        }

        var createOrderItemsList = function (order) {
            var listToReturn = [];
            for (var index = 0; index < order.items.length; index++) {
                var item = order.items[index];

                item['createdDate'] = order.createdDate;
                item['deliveryDate'] = '';
                item['branchId'] = order.branchId;

                listToReturn.push(item);
            }
            return listToReturn;
        }

        vm.openOrderDialog = function (order, ev) {
            $mdDialog.show({
                    controller: 'ViewOrderDialogController',
                    templateUrl: '/components/order/viewOrderDialog-template.html',
                    controllerAs: vm,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true,
                    locals: {
                        order: order
                    }
                })
                .then(function (answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

        vm.ordersFilter = {};
        vm.totalOrderCount = 0;
        vm.query = {
            order: 'createdTime',
            limit: 10,
            page: 1
        };



        vm.getOrders = function () {

            vm.query.order = 'createdTime';

            /*if (vm.tasksFilterFreeText !== undefined && vm.tasksFilterFreeText !== '') {
                vm.tasksFilter.description = {
                    "$regex": vm.tasksFilterFreeText,
                    "$options": "i"
                };
            } else {
                vm.tasksFilter['description'] = '';
            }

            for (var property in vm.tasksFilter) {
                if (vm.tasksFilter.hasOwnProperty(property)) {
                    if (property === 'cliqaId' &&
                        typeof vm.tasksFilter[property] !== 'object' &&
                        vm.tasksFilter[property].indexOf('$in') !== -1) {
                        vm.tasksFilter[property] = JSON.parse(vm.tasksFilter[property]);
                    }
                    if (vm.tasksFilter[property] === '') {
                        delete vm.tasksFilter[property];
                    }
                }
            }*/


            server.getAllOrdersCount(vm.ordersFilter).then(function (response) {
                vm.totalOrderCount = response.data;
            });

            var deferred = $q.defer();
            vm.promise = deferred.promise;

            server.getAllOrders(vm.query, vm.ordersFilter).then(function (response) {
                vm.orders = response.data;
                deferred.resolve();
            })
        };

        vm.branches = dataContext.getBranches();
        vm.networks = dataContext.getNetworks();

        if (!vm.branches || !vm.networks) {
            server.getAllBranches().then(function (response) {
                var branchesMap = {};
                var networksList = [];
                for (var index = 0; index < response.data.length; index++) {
                    var b = response.data[index];
                    if (!branchesMap.hasOwnProperty(b.serialNumber)) {
                        branchesMap[b.serialNumber] = {name: b.name, id: b.serialNumber};
                    }
                    if (networksList.indexOf(b.network) === -1) {
                        networksList.push(b.network);
                    }
                }
                vm.branches = Object.values(branchesMap);
                vm.networks = networksList;
                dataContext.setBranches(vm.branches);
                dataContext.setNetworks(networksList);
            })
        }
        
        $timeout(function () {
            vm.getOrders();
        }, 0);

    }

}());