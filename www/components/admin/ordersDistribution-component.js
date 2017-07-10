(function () {
    'use strict';

    angular
        .module('app')
        .component('ordersDistribution', {
            bindings: {
                pageMode: '='
            },
            controller: ordersDistributionController,
            controllerAs: 'vm',
            templateUrl: 'components/admin/ordersDistribution-template.html'
        });

    function ordersDistributionController(server, $q, filesHandler, $filter, $timeout, dataContext) {

        var vm = this;

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

        vm.updateSum = function(count, item){
            item.sum = (item.s1count || 0) + (item.s2count || 0) + (item.s3count || 0);
        }

        vm.ordersItems = [];
        

        vm.initialFilter = {
            createdDate: new Date(new Date().setDate(10)) /// קומבינה של 1 בלילה, להעיף את זה
        };

        vm.totalOrderCount = 0;
        vm.query = {
            order: '-createdDate'
        };


        vm.getOrders = function (filter) {
            if (!filter) {
                var filter = {};
            }
            filter["type"] = 'order';

            var deferred = $q.defer();
            vm.promise = deferred.promise;

            server.getAllOrders(vm.query, filter).then(function (response) {
                vm.orders = response.data;
                /** --- HANDEL THIS !!!! --- */
                /*if (vm.ordersFilter.hasOwnProperty('departmentId')) {
                    for (var index = 0; index < vm.orders.length; index++) {
                        var order = vm.orders[index];
                        order.items = $filter('departmentsItems')(order.items, vm.ordersFilter['departmentId']);
                    }
                }*/

                vm.ordersItems = [];
                for (var index = 0; index < vm.orders.length; index++) {
                    
                    var order = vm.orders[index];
                    var orderWithOutItems = angular.copy(order);
                    delete orderWithOutItems.items;

                    for (var j = 0; j < order.items.length; j++) {
                        var item = order.items[j];
                        vm.ordersItems.push({
                            order: orderWithOutItems,
                            item: item,
                            sum: 0//,
                            // s1count: 0,
                            // s2count: 0,
                            // s3count: 0
                        });
                    }
                }

                deferred.resolve();
            })
        };

    }

}());