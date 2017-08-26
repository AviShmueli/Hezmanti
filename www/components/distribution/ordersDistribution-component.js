(function () {
    'use strict';

    angular
        .module('app')
        .component('ordersDistribution', {
            bindings: {
                isDistributedMode: '=',
                refreshData: '='
            },
            controller: ordersDistributionController,
            controllerAs: 'vm',
            templateUrl: 'components/distribution/ordersDistribution-template.html'
        });

    function ordersDistributionController($rootScope, $scope, server, $q, filesHandler, $filter, $timeout, dataContext,
        $mdToast, $mdDialog, $window, distributionContext, lodash) {

        var vm = this;
        vm.tableHeight = $window.innerHeight - 325;
        vm.checkAllTableSum = false;
        vm.downloading = false;
        var lastOrderId = distributionContext.getLastOrderId();

        var orderFields = {
            createdDate: 'ת. הזמנה',
            deliveryDate: 'ת. אספקה',
            branchId: 'מחסן',
            itemSerialNumber: 'פריט/ברקוד',
            count: 'מארזים'
        };

        vm.tableSummary = {
            count: 0,
            sum: 0
        }
        var pageMode = 'distribution';
        var allOrderItems = distributionContext.getDistributionState();
        var allDistributedItems = distributionContext.getDistributedState();

        var currDistributedItems = [];


        var catalog = dataContext.getCatalog();

        /* ---- initiate table ---- */

        var initiateDistributionData = function () {
            // TODO: insert to the filter the id of the last order that exict in local sorage,
            //       and filter by this id to get only the orders that not in the local storage.
            var filter = {
                'orderId': {'$gt': lastOrderId},
                '$or': [{
                    "type": 'order'
                }, {
                    "type": 'secondOrder'
                }]
            };
            var query = {
                'order': '-orderId'
            };

            var deferred = $q.defer();
            vm.promise = deferred.promise;
            vm.filteringTable = true;

            server.getAllOrders(query, filter).then(function (response) {
                
                var orders = response.data;

                if (orders.length < 1) {
                    vm.filteringTable = false;
                    deferred.resolve();
                    return;
                }

                lastOrderId = orders[0].orderId;
                distributionContext.setLastOrderId(lastOrderId);

                var newOrdersCount = 0;
                var newOrdersItems = [];
                for (var index = 0; index < orders.length; index++) {

                    var order = orders[index];

                    var isExcist = lodash.findIndex(allOrderItems, function (o) {
                        var a = o;
                        return o.order._id === order._id;
                    });
                    if (isExcist === -1) {
                        isExcist = lodash.findIndex(allDistributedItems, function (o) {
                            return o.order._id === order._id;
                        });
                    }
                    if (isExcist === -1) {
                        newOrdersCount++;
                        var orderWithOutItems = angular.copy(order);
                        delete orderWithOutItems.items;

                        var ordersDepartments = [];
                        for (var j = 0; j < order.items.length; j++) {
                            var item = order.items[j];
                            ordersDepartments.push(item.itemDepartmentId);
                            newOrdersItems.push({
                                order: orderWithOutItems,
                                item: item,
                                sum: 0,
                                id: order._id + (item.serialNumber || item.itemSerialNumber) + Math.floor(Math.random() * 100)
                            });
                        }

                        for (var department in ordersDepartments) {
                            if (catalog.hasOwnProperty(department)) {
                                var departmentItems = catalog[department];
                                departmentItems.forEach(function (item) {
                                    var itm = _.find(newOrdersItems, function (o) {
                                        return o.item.serialNumber === item.serialNumber;
                                    });
                                    if (!itm) {
                                        newOrdersItems.push({
                                            order: orderWithOutItems,
                                            item: {count: 0, itemDepartmentId: item.departmentId, itemName: item.name, itemSerialNumber: item.serialNumber, unit: item.unit},
                                            sum: 0,
                                            id: order._id + (item.serialNumber || item.itemSerialNumber) + Math.floor(Math.random() * 100)
                                        });
                                    }
                                }, this);
                            }
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
                    vm.ordersItems = allOrderItems;
                }

                vm.filterTable(vm.filter, vm.initialFilter);
                deferred.resolve();
            });
        }

        vm.refreshDataFromServer = function (ev) {
            initiateDistributionData();
            distributionContext.cleanOldDistributedData();
        }

        vm.showDistributedItems = function () {
            // var filter = {};

            // var deferred = $q.defer();
            // vm.promise = deferred.promise;
            // server.getDistributedItems(filter).then(function (response) {
            //     vm.ordersItems = response.data;
            //     vm.allOrderItemsCount = vm.ordersItems.length;
            //     deferred.resolve();
            // });
            vm.ordersItems = allDistributedItems;
            vm.allOrderItemsCount = vm.ordersItems.length;
            vm.filterTable(vm.filter, {});
        }

        vm.showDistributionItems = function () {
            vm.ordersItems = allOrderItems;
            vm.allOrderItemsCount = vm.ordersItems.length;
            vm.filterTable(vm.filter, {});
        }

        if (angular.isUndefined(allOrderItems)) {
            allOrderItems = [];
            initiateDistributionData();
        } else {
            vm.ordersItems = allOrderItems;
            vm.allOrderItemsCount = allOrderItems.length;
        }

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
                    } else {
                        downloadExcel();
                    }
                }, 0);
                return;
            }

            downloadExcel();
        }

        var downloadExcel = function () {
            vm.downloading = true;
            var query = {
                order: vm.query.order
            }

            // map all items by suppliers
            var suppliersItemsMap = vm.mapAllItemsBySuppliers();

            // for each supplier download file
            for (var index = 0; index < vm.suppliers.length; index++) {

                var supplier = vm.suppliers[index];

                if (suppliersItemsMap.hasOwnProperty(supplier.supplierId)) {
                    var fileName = supplier.name + '_' + $filter('date')(new Date(), 'dd/MM/yyyy');
                    filesHandler.downloadOrderAsCSV(suppliersItemsMap[supplier.supplierId], orderFields, fileName);
                }
            }

            if (currDistributedItems && currDistributedItems.length > 0) {

                currDistributedItems.forEach(function (element) {
                    element["createdDate"] = new Date();
                }, this);

                // save the items in DB
                server.saveDistribution(currDistributedItems).then(function (response) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('הנתונים נשמרו בהצלחה!')
                        .hideDelay(3000)
                    );
                });

                // remove the distributed itms from the page
                currDistributedItems.forEach(function (element) {
                    lodash.remove(vm.ordersItems, function (n) {
                        return n.id === element.id;
                    });

                    lodash.remove(allOrderItems, function (n) {
                        return n.id === element.id;
                    });
                    vm.allOrderItemsCount = allOrderItems.length;
                }, this);

                allDistributedItems = allDistributedItems.concat(currDistributedItems);
                distributionContext.saveDistributedState(allDistributedItems);
                currDistributedItems = [];
            }

            vm.downloading = false;
            vm.checkAllTableSum = false;
        }

        vm.mapAllItemsBySuppliers = function () {
            var suppliersItemsMap = {};
            for (var index = 0; index < vm.ordersItems.length; index++) {
                var item = vm.ordersItems[index];
                if (item.suppliers && item.sum > 0) {
                    for (var supplierId in item.suppliers) {
                        if (item.suppliers.hasOwnProperty(supplierId)) {
                            var element = item.suppliers[supplierId];
                            if (!suppliersItemsMap.hasOwnProperty(supplierId)) {
                                suppliersItemsMap[supplierId] = [];
                            }
                            suppliersItemsMap[supplierId].push({
                                createdDate: $filter('date')(item.order.createdDate, 'dd/MM/yyyy'),
                                deliveryDate: item.order.type === 'secondOrder' ?
                                    $filter('date')(item.order.createdDate, 'dd/MM/yyyy') : getDeliveryDate(item.order.createdDate),
                                branchId: item.order.branchId,
                                itemSerialNumber: item.item.itemSerialNumber,
                                count: element
                            });
                        }
                    }
                    currDistributedItems.push(item);
                }
            }
            markItemsAsDistrebuted();

            return suppliersItemsMap;
        }

        var markItemsAsDistrebuted = function () {
            server.markItemsAsDistrebuted(currDistributedItems).then(function (result) {
                //vm.allDistributedItems = [];
            });
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
                item.sum += parseInt((item.suppliers[element.supplierId.toString()] || 0));
            }
        }



        /* ---- Filters----- */


        // initial with defult department
        vm.initialFilter = {
            departmentId: [1],
            orderItems: true
        };

        vm.filteringTable = true;
        vm.departments = null;
        vm.filter = {};
        vm.totalOrderCount = 0;
        vm.query = {
            order: '-order.orderId'
        };

        vm.filterTable = function (filter, originalFilter) {

            vm.resetSuppliersPresentValue();

            //vm.filteringTable = true;
            var deferred = $q.defer();
            vm.promise = deferred.promise;
            $timeout(function () {
                if (filter) {
                    vm.filter = filter;
                }

                if (originalFilter.hasOwnProperty("departmentId")) {
                    vm.selectedDepartments = originalFilter.departmentId;
                }

                var localFilter = {};

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
                // TODO: BUG - filter according to state, if this is distributed state search on allDistributed list
                if (vm.pageMode === 'distribution') {
                    vm.ordersItems = $filter('filter')(allOrderItems, localFilter, true);
                } else {
                    vm.ordersItems = $filter('filter')(allDistributedItems, localFilter, true);
                }

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
                vm.filteringTable = false;
                deferred.resolve();
            }, 0);
            return vm.promise;
        };

        /* ---- Suplier ----- */
        vm.selectedDepartments = vm.initialFilter.departmentId;
        vm.suppliers = []
        vm.departments = dataContext.getDepartments();
        $scope.$watch('vm.selectedDepartments', function (selectedDepartments) {

            vm.suppliers = [];
            selectedDepartments.forEach(function (element) {
                var department = _.find(vm.departments, function (o) {
                    return o.id === parseInt(element);
                });
                if (department) {
                    vm.suppliers = vm.suppliers.concat(department.suppliers);
                    vm.suppliers = lodash.uniqBy(vm.suppliers, 'supplierId');
                }
            }, this);

        });

        // currently not suported
        vm.removeSupplierFromView = function (supplier) {
            lodash.remove(vm.suppliers, function (n) {
                return n.supplierId === supplier.supplierId;
            });
        }

        // currently not suported
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
                    newSuppliers.forEach(function (element) {
                        element["show"] = true;
                    }, this);
                    vm.suppliers = vm.suppliers.concat(newSuppliers);
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

        vm.resetSuppliersPresentValue = function () {
            for (var key in vm.suppliers) {
                if (vm.suppliers.hasOwnProperty(key)) {
                    var element = vm.suppliers[key];
                    element.percent = '';
                }
            }
        }

        var timer;
        vm.updateAllItems = function (persent, supplierId) {
            $timeout.cancel(timer);
            timer = $timeout(function () {
                for (var index = 0; index < vm.ordersItems.length; index++) {
                    var orderItem = vm.ordersItems[index];
                    if (!orderItem.hasOwnProperty("suppliers")) {
                        orderItem["suppliers"] = {};
                    }

                    orderItem.suppliers[supplierId] = Math.round(orderItem.item.count * (persent * 0.01));

                    if (orderItem.suppliers[supplierId] === 0) {
                        delete orderItem.suppliers[supplierId];
                    }
                    vm.updateSum(orderItem);
                }
            }, 500);
        }

        $scope.$watch('vm.ordersItems', function (orders) {

            if (angular.isUndefined(orders)) {
                return;
            }

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
                            vm.tableSummary[key] += parseInt(val !== "" ? val : 0);
                        }
                    }
                }
            }, this);
        }, true);

        $scope.$watch('vm.isDistributedMode', function (mode) {
            if (angular.isUndefined(mode)) {
                vm.pageMode = 'distribution';
                return;
            }
            if (mode) {
                vm.pageMode = 'distributed';
                vm.showDistributedItems();
            } else {
                vm.pageMode = 'distribution';
                vm.filteringTable = true;
                $timeout(function () {
                    vm.showDistributionItems();
                }, 0)

            }
        });

        $scope.$watch('vm.refreshData', function (num) {
            if (num !== 0) {
                vm.refreshDataFromServer();
            }
        });

        vm.keyPressed = function (TB, e, row, col) {
            var idToFind;
            // go down
            if (e.keyCode == 40 || e.keyCode == 13) {
                idToFind = (row + 1) + 'c' + col;
            }
            // go up
            if (e.keyCode == 38) {
                idToFind = (row - 1) + 'c' + col;
            }
            // go left
            // if (e.keyCode == 37) {
            //     idToFind = row + 'c' + (col + 1);
            // }
            // go right
            // if (e.keyCode == 39) {
            //     idToFind = row + 'c' + (col - 1);
            // }

            var elementToFocus = document.getElementById(idToFind);
            if (elementToFocus) {
                elementToFocus.focus();
            }

            e.preventDefault();
        }

        vm.openOrderDialog = function (order, ev) {

            // need to get all orders items....

            /*$mdDialog.show({
                    controller: 'ViewOrderDialogController',
                    templateUrl: './components/order/viewOrderDialog-template.html',
                    controllerAs: vm,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        order: order,
                        showEditBtn: true,
                        mode: 'order'
                    }
                })
                .then(function (answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });*/
        }

    }

}());