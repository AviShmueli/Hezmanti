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

    function ordersDistributionController(server, $q, filesHandler, $filter, $timeout, dataContext, $mdToast, $mdDialog) {

        var vm = this;

        var orderFields = {
            createdDate: 'ת. הזמנה',
            deliveryDate: 'ת. אספקה',
            branchId: 'מחסן',
            itemSerialNumber: 'פריט/ברקוד',
            count: 'מארזים'
        };

        vm.checkAllTableSum = false;
        vm.downloading = false;
        vm.downloadFilterdTable = function () {
            if (!vm.checkAllTableSum) {
                vm.checkAllTableSum = true;
                $timeout(function () {
                    var result = document.getElementsByClassName("text-red");
                    if (result !== null && result.length > 0) {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('קיימים פריטים לא תקינים, נא לבדוק תקינות החלוקה')
                            .hideDelay(3000)
                        );
                    }
                }, 0);
                return;
            }

            vm.downloading = true;
            var query = {
                order: vm.query.order
            }

            var suppliersItemsMap = vm.mapAllItemsBySuppliers();

            for (var index = 0; index < vm.suppliers.length; index++) {

                var supplier = vm.suppliers[index];

                if (suppliersItemsMap.hasOwnProperty(supplier.id)) {
                    var fileName = supplier.name + '_' + $filter('date')(new Date(), 'dd/MM/yyyy');
                    filesHandler.downloadOrderAsCSV(suppliersItemsMap[supplier.id], orderFields, fileName);
                }
            }

            vm.downloading = false;
        }

        vm.mapAllItemsBySuppliers = function () {
            var suppliersItemsMap = {};
            for (var index = 0; index < vm.ordersItems.length; index++) {
                var item = vm.ordersItems[index];
                if (item.suppliers) {
                    for (var supplierId in item.suppliers) {
                        if (item.suppliers.hasOwnProperty(supplierId)) {
                            var element = item.suppliers[supplierId];
                            if (!suppliersItemsMap.hasOwnProperty(supplierId)) {
                                suppliersItemsMap[supplierId] = [];
                            }
                            suppliersItemsMap[supplierId].push({
                                createdDate: $filter('date')(item.order.createdDate, 'dd/MM/yyyy'),
                                deliveryDate: getDeliveryDate(item.order.createdDate),
                                branchId: item.order.branchId,
                                itemSerialNumber: item.item.itemSerialNumber,
                                count: element
                            });
                        }
                    }
                }
            }
            return suppliersItemsMap;
        }

        var getDeliveryDate = function (orderDate) {
            orderDate = new Date(orderDate);
            var day = orderDate.getDay();
            var deliveryDate = new Date(orderDate);
            if (day === 5) {
                deliveryDate.setDate(orderDate.getDate() + 2);
            } else {
                deliveryDate.setDate(orderDate.getDate() + 1);
            }
            return $filter('date')(deliveryDate, 'dd/MM/yyyy');
        }

        vm.updateSum = function (item) {
            item.sum = 0;
            for (var index = 0; index < vm.suppliers.length; index++) {
                var element = vm.suppliers[index];
                item.sum += (item.suppliers[element.id.toString()] || 0);
            }
        }

        vm.ordersItems = [];

        vm.initialFilter = {
            createdDate: new Date(new Date().setDate(12))
        };

        vm.departments = null;
        vm.filter = {};
        vm.totalOrderCount = 0;
        vm.query = {
            order: '-createdDate'
        };

        vm.getOrders = function (filter, departments) {

            if (filter) {
                vm.filter = filter;
            }

            //if (departments) {
                vm.departments = departments;
            //}

            vm.filter["type"] = 'order';

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
                            sum: 0
                        });
                    }
                }

                deferred.resolve();
            })
        };

        vm.suppliers = [{
                name: 'מילועוף',
                id: 30000,
                show: true
            },
            {
                name: 'עוף עוז',
                id: 30005,
                show: true
            },
            {
                name: 'עוף טוב',
                id: 30050,
                show: true
            },
        ];

        vm.addSupplier = function () {
            $mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                template: '<md-dialog dir="rtl" layout-padding>' +
                    ' <form name="newSupplier">' +
                    '  <md-dialog-content layout-margin>' +
                    '     <h2 class="md-title">נא להזין שם ומספר ספק</h2>' +
                    '     <br/>' +
                    '     <md-input-container class="md-block" flex>' +
                    '         <label>שם הספק</label>' +
                    '         <input ng-model="name" md-no-asterisk name="name" required >' +
                    '         <div ng-messages="newSupplier.name.$error">' +
                    '             <div ng-message="required">חובה להזין שם ספק</div>' +
                    '         </div>' +
                    '     </md-input-container>' +
                    '     <md-input-container class="md-block" flex>' +
                    '         <label>מזהה ספק</label>' +
                    '         <input ng-model="id" md-no-asterisk name="id" type="number" required >' +
                    '         <div ng-messages="newSupplier.id.$error">' +
                    '             <div ng-message="required">חובה להזין מזהה ספק</div>' +
                    '         </div>' +
                    '     </md-input-container>' +
                    '  </md-dialog-content>' +
                    '  <md-dialog-actions>' +
                    '     <md-button aria-label="ok" type="submit" ng-click="ok()" class="md-primary">הוסף</md-button>' +
                    '     <md-button aria-label="cancel" ng-click="cancel()" class="md-primary">בטל</md-button>' +
                    '  </md-dialog-actions>' +
                    ' </form>' +
                    '</md-dialog>',
                controller: function DialogController($scope, $mdDialog) {
                    $scope.cancel = function () {
                        $mdDialog.hide();
                    }
                    $scope.ok = function () {
                        if ($scope.newSupplier.$valid) {
                            $mdDialog.hide({
                                name: $scope.name,
                                id: $scope.id,
                                show: true
                            });
                        }

                    }
                }
            }).then(function (result) {
                if (result) {
                    vm.suppliers.push(result);
                }
            });
        }

    }

}());