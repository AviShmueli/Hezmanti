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
            templateUrl: 'components/distribution/ordersDistribution-template.html'
        });

    function ordersDistributionController($scope, server, $q, filesHandler, $filter, $timeout, dataContext,
        $mdToast, $mdDialog, $window, distributionContext, lodash) {

        var vm = this;
        vm.tableHeight = $window.innerHeight - 200;
        vm.checkAllTableSum = false;
        vm.downloading = false;


        var orderFields = {
            createdDate: 'ת. הזמנה',
            deliveryDate: 'ת. אספקה',
            branchId: 'מחסן',
            itemSerialNumber: 'פריט/ברקוד',
            count: 'מארזים'
        };

        /* ---- initiate table ---- */

        var initiateDistributionData = function () {
            var filter = {
                '$or': [{
                    "type": 'order'
                }, {
                    "type": 'secondOrder'
                }]
            };
            var query = {
                'order': '-createdDate'
            };

            var deferred = $q.defer();
            vm.promise = deferred.promise;

            server.getAllOrders(query, filter).then(function (response) {
                var orders = response.data;

                var newOrdersCount = 0;
                var newOrdersItems = [];
                for (var index = 0; index < orders.length; index++) {

                    var order = orders[index];

                    var isExcist = lodash.findIndex(allOrderItems, function (o) {
                        var a = o;
                        return o.order._id === order._id;
                    });
                    if (isExcist === -1) {
                        newOrdersCount++;
                        var orderWithOutItems = angular.copy(order);
                        delete orderWithOutItems.items;

                        for (var j = 0; j < order.items.length; j++) {
                            var item = order.items[j];
                            newOrdersItems.push({
                                order: orderWithOutItems,
                                item: item,
                                sum: 0
                            });
                        }
                    }
                }

                if (newOrdersCount > 0) {
                    var toastMessage = newOrdersCount > 1 ?
                        newOrdersCount + ' הזמנות חדשות התווספו בהצלחה' :
                        'הזמנה אחת התווספה בהצלחה'
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(toastMessage)
                        .hideDelay(3000)
                    );

                    allOrderItems = allOrderItems.concat(newOrdersItems);

                    distributionContext.saveDistributionState(allOrderItems);
                    vm.allOrderItemsCount = allOrderItems.length;
                    vm.ordersItems = allOrderItems; // ??

                    vm.getOrders(vm.filter, {}); // ??
                }
                deferred.resolve();
            });
        }

        vm.refreshDataFromServer = function (ev) {

            // var confirm = $mdDialog.confirm()
            //     .title('לרענן נתונים מהשרת?')
            //     .textContent('כל הנתונים על הדף ימחקו')
            //     .ariaLabel('Lucky day')
            //     .parent(angular.element(document.querySelector('#dialogsWraper')))
            //     .targetEvent(ev)
            //     .ok('רענן')
            //     .cancel('ביטול');
            // $mdDialog.show(confirm).then(function () {
            //     initiateDistributionData();
            // }, function () {});
            initiateDistributionData();
        }

        var allOrderItems = distributionContext.getDistributionState();

        if (angular.isUndefined(allOrderItems)) {
            allOrderItems = [];
            initiateDistributionData();
        } else {
            vm.ordersItems = allOrderItems;
            vm.allOrderItemsCount = allOrderItems.length;
        }
        vm.tableSummary = {
            count: 0,
            sum: 0
        }

        $scope.$watch('vm.ordersItems', function (orders) {
            vm.tableSummary = {
                count: 0,
                sum: 0
            };

            orders.forEach(function (order) {
                vm.tableSummary.count += order.item.count;
                vm.tableSummary.sum += order.sum || 0;
                if (order.suppliers) {
                    for (var key in order.suppliers) {
                        if (order.suppliers.hasOwnProperty(key)) {
                            var val = order.suppliers[key];
                            if (!vm.tableSummary.hasOwnProperty(key)) {
                                vm.tableSummary[key] = 0;
                            }
                            vm.tableSummary[key] += val;
                        }
                    }
                }
            }, this);
        }, true);


        /* ---- download order ---- */
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

            server.saveDistribution(vm.ordersItems).then(function (response) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('הנתונים נשמרו בהצלחה!')
                    .hideDelay(3000)
                );
            });

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



        /* ---- Filters----- */

        //vm.initialFilter = {
        //   createdDate: new Date(new Date().setDate(12))
        //};

        vm.departments = null;
        vm.filter = {};
        vm.totalOrderCount = 0;
        vm.query = {
            order: '-order.orderId'
        };

        vm.getOrders = function (filter, originalFilter) {

            var deferred = $q.defer();
            vm.promise = deferred.promise;

            if (filter) {
                vm.filter = filter;
            }

            var localFilter = {};

            /*if (filter.hasOwnProperty("items.itemName")) {
                localFilter["item"] = {$ : filter["items.itemName"].$regex};
            }*/

            if (filter.hasOwnProperty("unhandledItems") && filter.unhandledItems) {
                localFilter["sum"] = 0;
            }

            if (filter.hasOwnProperty("type") && filter.type === "secondOrder") {
                localFilter["order"] = {
                    type: "secondOrder"
                };
            } else {
                localFilter["order"] = {
                    type: "order"
                };
            }

            // filter unhendeled items & second orders
            vm.ordersItems = $filter('filter')(allOrderItems, localFilter, true);

            // filter by date
            if (filter.hasOwnProperty("createdDate")) {
                var filterdDate = filter.createdDate;
                var startDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate());
                var endDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate() + 1);
                vm.ordersItems = $filter('dateFilter')(vm.ordersItems, startDate, endDate);
            }

            if (Object.keys(originalFilter).length !== 0) {
                vm.ordersItems = $filter('distributionDataFilter')(vm.ordersItems, originalFilter);
            }

            //vm.ordersItems = $filter('orderBy')(vm.ordersItems, '-oreder.orderId');

            deferred.resolve();
        };



        /* ---- Suplier ----- */
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

        vm.addSupplier = function (ev) {
            $mdDialog.show({
                    controller: 'selectSuppliersController',
                    controllerAs: 'ctrl',
                    templateUrl: './components/suppliers/selectSuppliersDialog-template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function (newSuppliers) {
                    newSuppliers.forEach(function(element) {
                        element["show"] = true;
                    }, this);
                    vm.suppliers = vm.suppliers.concat(newSuppliers);
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

        var timer;
        vm.updateAllItems = function (persent, supplierId) {
            $timeout.cancel(timer);
            timer = $timeout(function () {
                for (var index = 0; index < vm.ordersItems.length; index++) {
                    var orderItem = vm.ordersItems[index];
                    if (!orderItem.hasOwnProperty("suppliers")) {
                        orderItem["suppliers"] = {};
                        orderItem.suppliers[supplierId] = Math.ceil(orderItem.item.count * (persent * 0.01));

                    } else {
                        orderItem.suppliers[supplierId] = Math.floor(orderItem.item.count * (persent * 0.01));
                    }
                    if (orderItem.suppliers[supplierId] === 0) {
                        delete orderItem.suppliers[supplierId];
                    }
                    vm.updateSum(orderItem);
                }
            }, 500);
        }

    }

}());