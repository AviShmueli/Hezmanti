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
        $mdToast, $mdDialog, $window, distributionContext, lodash,$interval) {

        var vm = this;
        vm.tableHeight = $window.innerHeight - 325;
        vm.checkAllTableSum = false;
        vm.downloading = false;
        console.log('ordersDistribution 000');
        var lastOrderId = distributionContext.getLastOrderId();

        /*// jos refersh page
        var c=0;
        
        $interval(function(){
        //$scope.$apply();
        console.log('ccc=',c,$scope.$$phase);
        c++;
        },10000);
        */


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
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',allOrderItems);
        var allDistributedItems = distributionContext.getDistributedState();
        console.log('ordersDistribution 1 1 allOrderItems',allOrderItems);
        console.log('ordersDistribution 1 2 allDistributedItems ',allDistributedItems );
        var currDistributedItems = [];


        


        var catalog = dataContext.getCatalog();

        /* ---- initiate table ---- */

        var initiateDistributionData = function () {
            console.log('ordersDistribution 2');
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
            console.log('ordersDistribution 3 0',query,filter);
            server.getAllOrders(query, filter).then(function (response) {
                console.log('ordersDistribution 3',response);
                
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
            console.log('ordersDistribution 4');
            initiateDistributionData();
            distributionContext.cleanOldDistributedData();
        }

        vm.showDistributedItems = function () {
            console.log('ordersDistribution 5');
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
            console.log('ordersDistribution 6');
            vm.ordersItems = allOrderItems;
            vm.allOrderItemsCount = vm.ordersItems.length;
            vm.filterTable(vm.filter, {});
        }

        if (angular.isUndefined(allOrderItems)) {
            console.log('ordersDistribution 777777777777777777777777777777777 0');
            allOrderItems = [];
            initiateDistributionData();
        } else {
            
            vm.ordersItems = allOrderItems;
            console.log('ordersDistribution 777777777777777777777777777777777 1');
            vm.allOrderItemsCount = allOrderItems.length;
        }

        /* ---- download order ---- */
        vm.downloadFilterdTable = function () {
            console.log('ordersDistribution 8');
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
            console.log('ordersDistribution 9');
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

                // save the items in DB##################################################################DB write
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
            console.log('ordersDistribution 10');
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
            console.log('ordersDistribution 11');
            server.markItemsAsDistrebuted(currDistributedItems).then(function (result) {
                //vm.allDistributedItems = [];
            });
        }

        var getDeliveryDate = function (orderDate) {
            console.log('ordersDistribution 12');
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
            console.log('ordersDistribution 13 sup=',vm.suppliers);
            console.log('ordersDistribution 13 itemm=',item);
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
            console.log('ordersDistribution 14',filter,originalFilter);
            vm.resetSuppliersPresentValue();

            //vm.filteringTable = true;
            var deferred = $q.defer();
            vm.promise = deferred.promise;
            $timeout(function () {
                console.log('ordersDistribution 15');
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
                if (vm.pageMode === 'distribution') {
                    vm.ordersItems = $filter('filter')(allOrderItems, localFilter, true);
                } else {
                    vm.ordersItems = $filter('filter')(allDistributedItems, localFilter, true);
                }
                
                // filter by date
                if (filter.hasOwnProperty("createdDate")) {
                    vm.f14=1;
                    var filterdDate = filter.createdDate;
                    var startDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate());
                    var endDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate() + 1);
                    vm.ordersItems = $filter('dateFilter')(vm.ordersItems, startDate, endDate);
                    
                }

                if (Object.keys(originalFilter).length !== 0) {
                   // here filter problem
                   console.log('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',originalFilter,vm.filter)
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
            console.log('ordersDistribution 16',selectedDepartments);
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
            console.log('ordersDistribution 17');
            lodash.remove(vm.suppliers, function (n) {
                return n.supplierId === supplier.supplierId;
            });
        }

        // currently not suported
        vm.addSupplier = function (ev) {
            console.log('ordersDistribution 18');
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
            console.log('ordersDistribution 19');
            for (var key in vm.suppliers) {
                if (vm.suppliers.hasOwnProperty(key)) {
                    var element = vm.suppliers[key];
                    element.percent = '';
                }
            }
        }

        var timer;
        vm.updateAllItems = function (persent, supplierId) {
            console.log('ordersDistribution 20');
            $timeout.cancel(timer);
            timer = $timeout(function () {
                console.log('ordersDistribution 21');
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
            console.log('#####################ordersDistribution 22',orders);



            
            //orders[0].suppliers['30004'] = 12;
            if (angular.isUndefined(orders)) {
                return;
            }
            if (vm.f14 == 1) {
                vm.f14 =0;
                //console.log('reserve component 22  in  f14=');
                //######################################### orders update
                var filterdDate = vm.filter.createdDate;
                var allsiryunItems = distributionContext.getReserveState();
                var startDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate());
                var endDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate() + 1);
                var orders1 = $filter('JosdateFilter')(allsiryunItems, startDate, endDate);
                //console.log('reserve component 19  in  f14=',orders1);
                

                console.log('reserve component 22  in after  f14=',orders[3]);



                for (var i = 0;i < orders.length;i++){
                    var item1 = orders[i].item;
                    if (parseInt(item1.count) > 0) {
                        //console.log('###############################   in if here 15',orders[i]);
                        var tot1=0;
                        for (var j=0;j < orders1.length;j++) {
                            if (orders1[j].item.itemSerialNumber == item1.itemSerialNumber) {
                             
                             //  tot1 += orders1[j].item.count ;
                             //  if (tot1 == 15) {
                             //      orders1[j].suppliers['30004'] = 14;
                              //console.log('############################### here 15',orders1[j].item);
                              
                                var sum1=0;
                                for (var sup1 in orders1[j].supp) {
                                    if (parseInt(orders1[j].supp[sup1][0].haluka) > 0) {
                                        if (!orders[i].hasOwnProperty("suppliers")) {
                                            orders[i]["suppliers"] = {};
                                        } 
                                        if (angular.isUndefined(orders[i].suppliers[sup1])){
                                            //console.log('############################### here 22 undefined ',sup1,orders[i].order.orderId,orders[i]);
                                            orders[i].suppliers[sup1] =  Math.round(parseInt(orders1[j].supp[sup1][0].haluka) / 100 * parseInt(item1.count)); 
                                        } else {
                                            var t=orders[i].suppliers[sup1];
                                            if (t.length === 0) {
                                               // console.log('############################### here 22 empty ',t.length,t,orders[i].order.orderId);
                                                orders[i].suppliers[sup1] = Math.round(parseInt(orders1[j].supp[sup1][0].haluka) / 100 * parseInt(item1.count));
                                                
                                            }
                                            // console.log('############innnnnnnnnnnnnnnnnnnnn here 15',orders1[j].supp[sup1],orders[i].suppliers[sup1]);
                                        }
                                        if ( angular.isNumber(orders[i].suppliers[sup1]) && (orders[i].suppliers[sup1].toString().length > 0 )) {
                                            sum1 += parseInt(orders[i].suppliers[sup1]);
                                        }
                                    }
                                   
                                }
                                orders[i].sum = sum1;
                            }
                        }
                        // orders[i].totorder = tot1 ;
                    }
                }
            }
            

            vm.tableSummary = {
                count: 0,
                sum: 0
            };

            orders.forEach(function (order) {
                console.log('ordersDistribution 23 order');
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
            console.log('ordersDistribution 24');
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
            console.log('ordersDistribution 25');
            if (num !== 0) {
                vm.refreshDataFromServer();
            }
        });

        vm.keyPressed = function (TB, e, row, col) {
            console.log('ordersDistribution 26');
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
            console.log('ordersDistribution 27');
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