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

    function ordersManagerController(server, $q, filesHandler, $filter, $mdDialog) {

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

        var deferred = $q.defer();
        vm.promise = deferred.promise;

        server.getAllOrders().then(function (response) {
            vm.orders = response.data;
            deferred.resolve();
        })

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
                    controller: function ($scope, $mdDialog) {

                        $scope.hide = function () {
                            $mdDialog.hide();
                        }
                        $scope.avi = 'avi';
                        $scope.order = order;
                    },
                    templateUrl: '/components/order/viewOrderDialog-template.html',
                    controllerAs: vm,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function (answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

    }

}());