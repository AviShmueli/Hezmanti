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

        var orderFields = {
            createdDate: 'ת. הזמנה',
            deliveryDate: 'ת. אספקה',
            branchId: 'מחסן',
            itemSerialNumber: 'פריט/ברקוד',
            count: 'מארזים'
        };

        vm.downloadExel = function (orderId) {
            server.getOrder(orderId).then(function (response) {
                var order = response.data;

                var fileName = order.orderId || order.branchId + '_' + $filter('date')(order.createdDate, 'dd/MM/yyyy');

                var orderItemsList = createOrderItemsList(order);
                filesHandler.downloadOrderAsCSV(orderItemsList, orderFields, fileName);
            });
        }

        vm.downloading = false;
        vm.downloadFilterdTable = function () {
            vm.downloading = true;
            var query = {
                order: vm.query.order
            }
            var fileName = new Date().getTime().toString();
            server.getAllOrders(query, filter).then(function (response) {
                var orders = response.data;
                if (vm.ordersFilter.hasOwnProperty('departmentId')) {
                    for (var index = 0; index < orders.length; index++) {
                        var order = orders[index];
                        order.items = $filter('departmentsItems')(order.items, vm.ordersFilter['departmentId']);
                    }
                }


                var orderItemsList = [];
                for (var index = 0; index < orders.length; index++) {
                    var order = orders[index];
                    orderItemsList = orderItemsList.concat(createOrderItemsList(order));
                }
                filesHandler.downloadOrderAsCSV(orderItemsList, orderFields, fileName);
                vm.downloading = false;
            })
        }

        var createOrderItemsList = function (order) {
            var listToReturn = [];
            for (var index = 0; index < order.items.length; index++) {
                var item = order.items[index];

                item['createdDate'] = $filter('date')(order.createdDate, 'dd/MM/yyyy');;
                item['deliveryDate'] = '';
                item['branchId'] = order.branchId;

                listToReturn.push(item);
            }
            return listToReturn;
        }

        vm.openOrderDialog = function (order, ev) {
            $mdDialog.show({
                    controller: 'ViewOrderDialogController',
                    templateUrl: './components/order/viewOrderDialog-template.html',
                    controllerAs: vm,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        order: order,
                        showEditBtn: true
                    }
                })
                .then(function (answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

        vm.ordersFilter = {};
        var filter = {};
        vm.totalOrderCount = 0;
        vm.query = {
            order: '-createdDate',
            limit: 10,
            page: 1
        };


        vm.getOrders = function () {
            filter = {};

            var includeNetwork = true;
            if (vm.ordersFilter.hasOwnProperty('branchId') && vm.ordersFilter.hasOwnProperty('networkId')) {
                includeNetwork = false;
            }

            for (var property in vm.ordersFilter) {
                if (vm.ordersFilter.hasOwnProperty(property)) {
                    if (vm.ordersFilter[property] === '') {
                        delete vm.ordersFilter[property];
                    }

                    if (property !== 'networkId' || (property === 'networkId' && includeNetwork)) {
                        if (typeof (vm.ordersFilter[property]) !== "string") {
                            for (var index = 0; index < vm.ordersFilter[property].length; index++) {
                                var element = vm.ordersFilter[property][index];
                                if (!filter.hasOwnProperty('$or')) {
                                    filter['$or'] = [];
                                }
                                var obj = {};
                                if (property === 'departmentId') {
                                    obj['items.itemDepartmentId'] = parseInt(element);
                                } else {
                                    obj[property] = element;
                                }
                                filter['$or'].push(obj);
                            }
                        }
                    }
                }
            }

            // handel the free text input
            if (vm.ordersFilterFreeText !== undefined && vm.ordersFilterFreeText !== '') {
                filter['items.itemName'] = {
                    "$regex": vm.ordersFilterFreeText,
                    "$options": "i"
                };
            } else {
                delete vm.ordersFilter['items'];
            }

            // handel the date input
            if (vm.ordersFilterCreatedDate !== undefined && vm.ordersFilterCreatedDate !== null && vm.ordersFilterCreatedDate !== '') {
                filter['createdDate'] = vm.ordersFilterCreatedDate.toLocaleDateString()
            } else {
                delete vm.ordersFilter.createdDate;
            }


            server.getAllOrdersCount(filter).then(function (response) {
                vm.totalOrderCount = response.data;
            });

            var deferred = $q.defer();
            vm.promise = deferred.promise;

            server.getAllOrders(vm.query, filter).then(function (response) {
                vm.orders = response.data;
                if (vm.ordersFilter.hasOwnProperty('departmentId')) {
                    for (var index = 0; index < vm.orders.length; index++) {
                        var order = vm.orders[index];
                        order.items = $filter('departmentsItems')(order.items, vm.ordersFilter['departmentId']);
                    }
                }
                deferred.resolve();
            })
        };

        vm.branches = dataContext.getBranches();
        vm.networks = dataContext.getNetworks();
        vm.departments = dataContext.getDepartments();
        vm.networksBranchesMap = dataContext.getNetworksBranchesMap();

        if (!vm.branches || !vm.networks || !vm.networksBranchesMap) {
            server.getAllBranches().then(function (response) {
                var branchesMap = {};
                var networksMap = {};
                var networksBranchesMap = {};
                for (var index = 0; index < response.data.length; index++) {
                    var b = response.data[index];
                    if (!branchesMap.hasOwnProperty(b.serialNumber)) {
                        branchesMap[b.serialNumber] = {
                            name: b.name,
                            id: b.serialNumber
                        };
                    }
                    if (!networksMap.hasOwnProperty(b.networkId)) {
                        networksMap[b.networkId] = {
                            name: b.networkName,
                            id: b.networkId
                        };
                    }
                    if (!networksBranchesMap.hasOwnProperty(b.networkId)) {
                        networksBranchesMap[b.networkId] = [];
                    }
                    networksBranchesMap[b.networkId].push({
                        name: b.name,
                        id: b.serialNumber
                    });
                }
                vm.branches = Object.values(branchesMap);
                vm.networks = Object.values(networksMap);
                vm.networksBranchesMap = networksBranchesMap;

                dataContext.setBranches(vm.branches);
                dataContext.setNetworks(vm.networks);
                dataContext.setNetworksBranchesMap(vm.networksBranchesMap);
            })
        }

        $timeout(function () {
            vm.getOrders();
        }, 0);

    }

}());