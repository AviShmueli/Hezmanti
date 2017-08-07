(function () {
    'use strict';

    angular
        .module('app')
        .component('ordersManager', {
            bindings: {
                pageMode: '='
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
            server.getAllOrders(query, vm.filter).then(function (response) {
                var orders = response.data;
                if (vm.departments) {
                    for (var index = 0; index < orders.length; index++) {
                        var order = orders[index];
                        order.items = $filter('departmentsItems')(order.items, vm.departments);
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
                        showEditBtn: true,
                        mode: vm.pageMode
                    }
                })
                .then(function (answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

        vm.departments = null;
        vm.filter = {};
        vm.totalOrderCount = 0;
        vm.query = {
            order: '-orderId',
            limit: 10,
            page: 1
        };

        vm.getPage = function(){

        }

        vm.getOrders = function (filter, originalFilter) {
            
            if (filter && typeof(filter) !== 'number') {
                vm.filter = filter;
                vm.query.page = 1;
            }

            //if (departments) {
                vm.departments = originalFilter.departmentId;
            //}
            if (vm.pageMode === 'order') {
                if (!vm.filter.hasOwnProperty("$or")) {
                    vm.filter["$or"] = [];
                }
                vm.filter["$or"].push({"type": 'order'});
                vm.filter["$or"].push({"type": 'secondOrder'});
            }
            if (vm.pageMode === 'stock') {
                vm.filter["type"] = 'stock';
            }
            


            server.getAllOrdersCount(vm.filter).then(function (response) {
                vm.totalOrderCount = response.data;
            });

            var deferred = $q.defer();
            vm.promise = deferred.promise;



            server.getAllOrders(vm.query, vm.filter).then(function (response) {
                vm.orders = response.data;

                if (vm.departments) {
                    for (var index = 0; index < vm.orders.length; index++) {
                        var order = vm.orders[index];
                        order.items = $filter('departmentsItems')(order.items, vm.departments);
                    }
                }

                
                deferred.resolve();
            });

            //vm.filter = {};
        };

    }

}());