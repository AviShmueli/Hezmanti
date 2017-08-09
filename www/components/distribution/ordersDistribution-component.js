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
        vm.tableHeight = $window.innerHeight - 360;
        vm.checkAllTableSum = false;
        vm.downloading = false;
        vm.distributedItemsList = [];

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
                'order': '-orderId'
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
                                sum: 0,
                                id: order._id + (item.serialNumber || item.itemSerialNumber) + Math.floor(Math.random() * 100)
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
            initiateDistributionData();
        }

        vm.showDistributedItems = function (ev) {
            var filter = {};

            var deferred = $q.defer();
            vm.promise = deferred.promise;
            server.getDistributedItems(filter).then(function (response) {
                vm.ordersItems = response.data;
                vm.allOrderItemsCount = vm.ordersItems.length;
                deferred.resolve();
            });
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
            
            if(angular.isUndefined(orders)){
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

            var suppliersItemsMap = vm.mapAllItemsBySuppliers();

            for (var index = 0; index < vm.suppliers.length; index++) {

                var supplier = vm.suppliers[index];

                if (suppliersItemsMap.hasOwnProperty(supplier.supplierId)) {
                    var fileName = supplier.name + '_' + $filter('date')(new Date(), 'dd/MM/yyyy');
                    filesHandler.downloadOrderAsCSV(suppliersItemsMap[supplier.supplierId], orderFields, fileName);
                }
            }

            vm.ordersItems.forEach(function(element) {
                element["createdDate"] = new Date();    
            }, this);

            server.saveDistribution(vm.ordersItems).then(function (response) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('הנתונים נשמרו בהצלחה!')
                    .hideDelay(3000)
                );
            });

            vm.downloading = false;
            vm.checkAllTableSum = false;
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
                    vm.distributedItemsList.push(item);
                    removeItemFromAllItemsList(item);
                    
                }
            }

            vm.distributedItemsList.forEach(function(element) {
                lodash.remove(vm.ordersItems, function (n) {
                        return n.id === element.id;
                    });
            }, this);
            

            markItemsAsDistrebuted();

            return suppliersItemsMap;
        }

        var removeItemFromAllItemsList = function (item) {
            lodash.remove(allOrderItems, function (n) {
                return n.id === item.id;
            });
            vm.allOrderItemsCount = allOrderItems.length;
        }

        var markItemsAsDistrebuted = function () {
            server.markItemsAsDistrebuted(vm.distributedItemsList).then(function (result) {
                vm.distributedItemsList = [];
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
                item.sum += (item.suppliers[element.supplierId.toString()] || 0);
            }
        }



        /* ---- Filters----- */


        // initial with defult department
        vm.initialFilter = {
            departmentId: [1]
        };

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

            if (originalFilter.hasOwnProperty("departmentId")) {
                vm.selectedDepartments = originalFilter.departmentId;
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

        vm.removeSupplierFromView = function(supplier){
            lodash.remove(vm.suppliers, function (n) {
                return n.supplierId === supplier.supplierId;
            });
        }

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

    }

}());