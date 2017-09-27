(function () {
    'use strict';

    angular
        .module('app')
        .component('josSiryun', {
            bindings: {
                isDistributedMode: '=',
                refreshData: '='
            },
            controller: josSiryunController,
            controllerAs: 'vm',
            templateUrl: 'components/jos/josSiryun-template.html'
        });

    function josSiryunController($rootScope, $scope, server, $q, filesHandler, $filter, $timeout, dataContext,
        $mdToast, $mdDialog, $window, josSiryunContext, lodash) {
            console.log('josSiryunController component');
        var vm = this;
        vm.tableHeight = $window.innerHeight - 325;
        vm.checkAllTableSum = false;
        vm.downloading = false;
        //var lastOrderId = josSiryunContext.getLastOrderId();

        /*var orderFields = {
            createdDate: 'ת. הזמנה',
            deliveryDate: 'ת. אספקה',
            branchId: 'מחסן',
            itemSerialNumber: 'פריט/ברקוד',
            count: 'מארזים'
        };
*/

          vm.jos_dep = dataContext.getDepartments();
          vm.jos_cat = dataContext.getCatalog();
          //console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",vm.jos_cat[1][1]);

          var myo = [];
          var myit = [];
          for (var j = 0; j < vm.jos_cat[1].length; j++) {
            var item1 = vm.jos_cat[1][j];
            myit.push({
                item: item1.name,
                itemser: item1.serialNumber,
                id: j,
                totsiryun: 0,
                totorder: 0,
                tothaluka: 0,
                tothoser: 0,
                totodef: 0,
                
            });
          
        }


          for (var index = 0; index < vm.jos_dep[7].suppliers.length; index++) {
            
                 var sup1 = vm.jos_dep[7].suppliers[index];
                 var it1 = [];
                 
                 for (var j = 0; j < vm.jos_cat[1].length; j++) {
                     var item1 = vm.jos_cat[1][j];
                     it1.push({
                         item: item1.name,
                         
                         itemser: item1.serialNumber,
                         haluka: 0,
                         siryun: 0,
                         husman: 0,
                         
                     });
                   
                 }
                 myo.push({
                    supid: sup1.supplierId,
                    supname: sup1.name,
                    items: it1,
                });

           }
           vm.all_myo = myo;
           vm.all_myit = myit;
           //console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  my all",vm.all_myit);



        vm.tableSummary = {
            count: 0,
            sum: 0
        }
        var pageMode = 'distribution';
        var allOrderItems = josSiryunContext.getDistributionState();
        var allDistributedItems = josSiryunContext.getDistributedState();

        var currDistributedItems = [];


        var catalog = dataContext.getCatalog();


        /* ---- initiate table ---- */

        var initiateDistributionData = function () {
            console.log('ordersDistribution component 1');
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
                console.log('ordersDistribution component 2');
                var orders = response.data;

                if (orders.length < 1) {
                    vm.filteringTable = false;
                    deferred.resolve();
                    return;
                }

                lastOrderId = orders[0].orderId;
                josSiryunContext.setLastOrderId(lastOrderId);

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

                    josSiryunContext.saveDistributionState(allOrderItems);
                    vm.allOrderItemsCount = allOrderItems.length;
                    vm.ordersItems = allOrderItems;
                }

                vm.filterTable(vm.filter, vm.initialFilter);
                deferred.resolve();
            });
        }

        vm.refreshDataFromServer = function (ev) {
            console.log('ordersDistribution component 3');
            initiateDistributionData();
            josSiryunContext.cleanOldDistributedData();
        }

        vm.showDistributedItems = function () {
            console.log('ordersDistribution component 4');
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
            console.log('ordersDistribution component 5');
            vm.ordersItems = allOrderItems;
            vm.allOrderItemsCount = vm.ordersItems.length;
            vm.filterTable(vm.filter, {});
        }

        if (angular.isUndefined(allOrderItems)) {
            console.log('ordersDistribution component 6');
            allOrderItems = [];
            initiateDistributionData();
        } else {
            console.log('ordersDistribution component 7');
            vm.ordersItems = allOrderItems;
            vm.allOrderItemsCount = allOrderItems.length;
        }

        /* ---- download order ---- */
        vm.downloadFilterdTable = function () {
            console.log('ordersDistribution component 8');
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

        
        vm.mapAllItemsBySuppliers = function () {
            console.log('ordersDistribution component 10');
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
            console.log('ordersDistribution component 11');
            server.markItemsAsDistrebuted(currDistributedItems).then(function (result) {
                //vm.allDistributedItems = [];
            });
        }

        var getDeliveryDate = function (orderDate) {
            console.log('ordersDistribution component  12');
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
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>component 13',item);
            item.totorder = parseInt(item.totsiryun) + 7;
           // for (var index = 0; index < vm.suppliers.length; index++) {
           //     var element = vm.suppliers[index];
           //     item.sum += parseInt((item.suppliers[element.supplierId.toString()] || 0));
           // }
        }
        vm.updateLine = function (item,line) {
           // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>component 14',item);
            item.items[line].husman=12;
            vm.all_myit[line].totsiryun =33;
           // item.totorder = parseInt(item.totsiryun) + 7;
           // for (var index = 0; index < vm.suppliers.length; index++) {
           //     var element = vm.suppliers[index];
           //     item.sum += parseInt((item.suppliers[element.supplierId.toString()] || 0));
           // }
        }
        vm.updateLineHaluka = function (item,line) {
           
            //item.items[line].husman=12;
            //vm.all_myit[line].totsiryun =33;
            item.items[line].husman= parseInt(item.items[line].haluka)/100 * vm.all_myit[line].totorder;
            var toth=0;
            for (var index = 0; index < vm.all_myo.length; index++) {
                toth += parseInt(vm.all_myo[index].items[line].husman);
            }
            vm.all_myit[line].tothaluka = toth;
          
        }
        vm.updateLineOrder = function (line) {
            var toth=0;
            for (var index = 0; index < vm.all_myo.length; index++) {
                vm.all_myo[index].items[line].husman= parseInt(vm.all_myo[index].items[line].haluka)/100 * vm.all_myit[line].totorder;
                toth += parseInt(vm.all_myo[index].items[line].husman);
            }
            vm.all_myit[line].tothaluka = toth;
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
            console.log('ordersDistribution component 14');
            vm.resetSuppliersPresentValue();

            //vm.filteringTable = true;
            var deferred = $q.defer();
            vm.promise = deferred.promise;
            $timeout(function () {
                console.log('ordersDistribution component 15');
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
        
        vm.suppliers = [];
        vm.departments = dataContext.getDepartments();
        
    /*    $scope.$watch('vm.selectedDepartments', function (selectedDepartments) {
            console.log('ordersDistribution component 16');
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
      */  
        // currently not suported
        






        vm.removeSupplierFromView = function (supplier) {
            console.log('ordersDistribution component 17');
            lodash.remove(vm.suppliers, function (n) {
                return n.supplierId === supplier.supplierId;
            });
        }

        // currently not suported
       /* vm.addSupplier = function (ev) {
            console.log('ordersDistribution component 18');
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
*/
        vm.resetSuppliersPresentValue = function () {
            console.log('ordersDistribution component 19');
            for (var key in vm.suppliers) {
                if (vm.suppliers.hasOwnProperty(key)) {
                    var element = vm.suppliers[key];
                    element.percent = '';
                }
            }
        }

        var timer;
        vm.updateAllItems = function (persent, supplierId) {
            console.log('ordersDistribution component 20');
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
          //  console.log('ordersDistribution component 21',orders);
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
            console.log('ordersDistribution component 22');
            if (angular.isUndefined(mode)) {
                console.log('ordersDistribution component 22 1');
                vm.pageMode = 'distribution';
                return;
            }
            if (mode) {
                vm.pageMode = 'distributed';
                console.log('ordersDistribution component 22 2');
                vm.showDistributedItems();
            } else {
                vm.pageMode = 'distribution';
                console.log('ordersDistribution component 22 3');
                vm.filteringTable = true;
                $timeout(function () {
                    vm.showDistributionItems();
                }, 0)

            }
        });

        $scope.$watch('vm.refreshData', function (num) {
            console.log('ordersDistribution component 23');
            if (num !== 0) {
                console.log('ordersDistribution component 23 1');
                vm.refreshDataFromServer();
            }
        });

        vm.keyPressed = function (TB, e, row, col) {
            console.log('ordersDistribution component 24');
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
            console.log('ordersDistribution component 25');
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