(function () {
    'use strict';

    angular
        .module('app')
        .component('reserve', {
            bindings: {
                isDistributedMode: '=',
                refreshData: '='
            },
            controller: reserveController,
            controllerAs: 'vm',
            templateUrl: 'components/reserve/reserve-template.html'
        }); 

    function reserveController($rootScope, $scope, server, $q, filesHandler, $filter, $timeout, dataContext,
        $mdToast, $mdDialog, $window, reserveContext, lodash) {
            console.log('reserve component');
        var vm = this;
        vm.f14 = 0;
        vm.tableHeight = $window.innerHeight - 325;
        vm.checkAllTableSum = false;
        vm.downloading = false;
        var lastOrderId =123;// reserveContext.getLastOrderId();

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
        var pageMode = 'reserve';
        var reserveState = reserveContext.getReserveState();
        console.log('state in beginnnnnnnnnnnnnnnnnnnnnnnnn',reserveState);
       // reserveContext.cleanOldDistributedData();//jos
      //  var allDistributedItems = reserveContext.getDistributedState();

        var currDistributedItems = [];


        var catalog = dataContext.getCatalog();

        /* ---- initiate table ---- */

        var initiateReserveData = function () {
            console.log('reserve component 1');
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
                console.log('reserve component 2');
                var orders = response.data;

              //  if (orders.length < 1) {
              //      vm.filteringTable = false;
              //      deferred.resolve();
              //      return;
              //  }

              //  lastOrderId = orders[0].orderId;
         /*       reserveContext.setLastOrderId(lastOrderId);
                var newJosItems = [];
               for (var department in vm.departments) {
                    if (catalog.hasOwnProperty(department)) {
                        var departmentItems = catalog[department];
                        departmentItems.forEach(function (item) {
                           
                            newJosItems.push({
                                    
                                    item: {count: 0, itemDepartmentId: item.departmentId, itemName: item.name, itemSerialNumber: item.serialNumber, unit: item.unit},
                                    sum: 0,
                                    id:  (item.serialNumber || item.itemSerialNumber) + Math.floor(Math.random() * 100)
                                });
                           
                        });
                    
                    }
                   
                }

                console.log("cccccccccccccccccccccccccccccccccccccccccccc",newJosItems);

*/



           // console.log("cccccccccccccccccccccccccccccccccccccccccccc",vm.departments);
                var newOrdersCount = 0;
                var newOrdersItems = [];
         /*       for (var index = 0; index < orders.length; index++) {

                    var order = orders[index];

                    var isExcist = lodash.findIndex(reserveState, function (o) {
                        var a = o;
                        return o.order._id === order._id;
                    });
                   // if (isExcist === -1) {
                   //     isExcist = lodash.findIndex(allDistributedItems, function (o) {
                   //         return o.order._id === order._id;
                   //     });
                   // }
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
*/
                if (newOrdersCount > 0) {
                    var toastMessage = newOrdersCount > 1 ?
                        newOrdersCount + ' הזמנות חדשות התווספו בהצלחה' :
                        'הזמנה אחת התווספה בהצלחה'
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent(toastMessage)
                        .hideDelay(3000)
                    );
                    console.log('bad!!!   state adddddddddddddddddddddddddddddddddddddddddd');
                    reserveState = reserveState.concat(newOrdersItems);

                    reserveContext.saveReserveState(reserveState);
                    vm.reserveStateCount = reserveState.length;
                    vm.ordersItems = reserveState;
                }

                vm.filterTable(vm.filter, vm.initialFilter);
                deferred.resolve();
            });
        }

        vm.refreshDataFromServer = function (ev) {
            console.log('reserve component 3');
            initiateReserveData();
          //  reserveContext.cleanOldDistributedData();
        }

        vm.showDistributedItems = function () {
            // var filter = {};
            console.log('reserve component 4');
            // var deferred = $q.defer();
            // vm.promise = deferred.promise;
            // server.getDistributedItems(filter).then(function (response) {
            //     vm.ordersItems = response.data;
            //     vm.reserveStateCount = vm.ordersItems.length;
            //     deferred.resolve();
            // });
            vm.ordersItems = allDistributedItems;
            vm.reserveStateCount = vm.ordersItems.length;
            vm.filterTable(vm.filter, {});
        }

        vm.showReserveItems = function () {
            console.log('reserve component 5');
            vm.ordersItems = reserveState;
            vm.reserveStateCount = vm.ordersItems.length;
            vm.filterTable(vm.filter, {});
        }

        if (angular.isUndefined(reserveState)) {
            console.log('reserve component 6');
            console.log('77777777777777777 0');
            reserveState = [];
            initiateReserveData();
        } else {
            
         //jos why?????   vm.ordersItems = reserveState;
            console.log('77777777777777777 1',vm.ordersItems );
            vm.reserveStateCount = reserveState.length;
        }

        /* ---- download order ---- */
        vm.downloadFilterdTable = function () {
            console.log('reserve component 8');
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
            console.log('reserve component 10');
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
            console.log('reserve component 11');
            server.markItemsAsDistrebuted(currDistributedItems).then(function (result) {
                //vm.allDistributedItems = [];
            });
        }

        var getDeliveryDate = function (orderDate) {
            console.log('reserve component 12');
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

        vm.updateSum = function (lineitem,sup) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>reserve component 13',lineitem,sup);
            //var haluka1 = lineitem.supp[sup][0].haluka;
            //lineitem.supp[sup][0].husman = Math.round(parseInt(lineitem.totorder) * parseInt(lineitem.supp[sup][0].haluka) / 100);
            
            //lineitem.count = 12;

           // for (var index = 0; index < vm.suppliers.length; index++) {
           //     var element = vm.suppliers[index];
           //     item.sum += parseInt((item.suppliers[element.supplierId.toString()] || 0));
           // }
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
            console.log('in filter  14')
          //  vm.resetSuppliersPresentValue();

            
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

            //    if (filter.hasOwnProperty("unhandledItems") && filter.unhandledItems) {
            //        localFilter["sum"] = 0;
            //    }

            //    if (filter.hasOwnProperty("type") && filter.type === "secondOrder") {
            //        localFilter["order"] = {
            //            type: "secondOrder"
            //        };
            //    } else {
                    localFilter["order"] = {
                        type: "order"
                    };
            //    }
            // filter unhendeled items & second orders
                // ################# jos put all table here with date
              //  if (vm.pageMode === 'reserve') {
                   
                  //  console.log('#############@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#####333 14 00',vm.ordersItems.length,reserveState);
                 //   vm.ordersItems = $filter('filter')(reserveState, localFilter, true);
                 //  console.log('#############@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#####333 14 01',vm.ordersItems.length,reserveState);
              //  } else {
              //      vm.ordersItems = $filter('filter')(allDistributedItems, localFilter, true);
             //   }
               
                // filter by date
                if (filter.hasOwnProperty("createdDate")) {
                    
                    vm.ordersItems = reserveState;


                    var filterdDate = filter.createdDate;
                    var startDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate());
                    var endDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate() + 1);
                    vm.ordersItems = $filter('JosdateFilter')(vm.ordersItems, startDate, endDate);
                    
               
                    if (vm.ordersItems.length === 0) {
                        
                        var newJosItems = [];
                        for (var department in vm.departments) {
                            
                           if (department == 7) {//<<<<<<<<<<<<<<<<<<<<<<<<<<fix it jos
                            var dep1 = vm.departments[department];
                            var supmap = {};
                            var sup1=[];
                            for (var j = 0; j < dep1.suppliers.length; j++) {
                                supmap[dep1.suppliers[j].supplierId] = [];
                                   supmap[dep1.suppliers[j].supplierId].push({
                                       suppId:dep1.suppliers[j].supplierId,
                                       haluka: 0,
                                       siryun: 0,
                                       husman: 0,
                                   });

                            }


                      
                             var departmentItems = catalog[1];//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<fix it jos
                         
                             departmentItems.forEach(function (item) {

                                 newJosItems.push({
                                         createdDate: filterdDate,
                                         item: {count: 0, itemDepartmentId: item.departmentId, itemName: item.name, itemSerialNumber: item.serialNumber, unit: item.unit},
                                         sum: 0,
                                         totsiryun: 0,
                                         totorder: 0,
                                         tothaluka: 0,
                                         tothoser: 0,
                                         totodef: 0,
                                         supp: supmap,
                                         id:  (item.serialNumber || item.itemSerialNumber) + Math.floor(Math.random() * 100)
                                     });
                                     
                                
                             });
                         
                       
                        
                        }
                    }
     
                     vm.ordersItems = newJosItems;
                     
                     reserveState = reserveState.concat(newJosItems);
                     
                     reserveContext.saveReserveState(reserveState);
                   //  reserveContext.saveReserveState(reserveState);
                                       //  vm.reserveStateCount = reserveState.length;
                                       //  vm.ordersItems = reserveState;
                    }
                    vm.f14 = 1;
                }
              //  if (Object.keys(originalFilter).length !== 0) {
                  //  vm.ordersItems = $filter('distributionDataFilter')(vm.ordersItems, originalFilter);
              //  }
           //    vm.ordersItems = $filter('orderBy')(vm.ordersItems, '-oreder.orderId');
                vm.filteringTable = false;
                //o.suppliers[supplier.supplierId.toString()]
                deferred.resolve();
            }, 0);
           

            return vm.promise;
        };

        /* ---- Suplier ----- */
        vm.selectedDepartments = vm.initialFilter.departmentId;
        vm.suppliers = []
        vm.departments = dataContext.getDepartments();

        $scope.$watch('vm.selectedDepartments', function (selectedDepartments) {
            console.log('reserve component 15');
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
            console.log('reserve component 16');
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
            console.log('reserve component 17');
            for (var key in vm.suppliers) {
                if (vm.suppliers.hasOwnProperty(key)) {
                    var element = vm.suppliers[key];
                    element.percent = '';
                }
            }
        }

        var timer;
        vm.updateAllItems = function (persent, supplierId) {
            console.log('reserve component 18');
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
            console.log('reserve component 19   ');
            if (vm.f14 == 1) {
                vm.f14 =0;
             //   console.log('reserve component 19  in  f14=');
                //######################################### orders update
                var filterdDate = vm.filter.createdDate;
                var allOrderItems = reserveContext.getDistributionState();
                var startDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate());
                var endDate = new Date(filterdDate.getFullYear(), filterdDate.getMonth(), filterdDate.getDate() + 1);
                var orders1 = $filter('dateFilter')(allOrderItems, startDate, endDate);
                console.log('reserve component 19  in  f14=',orders1,orders1.length,orders.length);
                for (var i = 0;i < orders.length;i++){
                    var item1 = orders[i].item;
                    for (var sup1 in orders[i].supp) {
                        orders[i].supp[sup1][0].husman = 0;
                    }
                    //console.log('reserve component 19  in  f14=',orders1,item1);
                    var tot1=0;
                    var sumhus1=0;
                    for (var j=0 ; j < orders1.length; j++) {
                       // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>oid=',item1,orders1[j].order.orderId,j);
                        if (orders1[j].item.itemSerialNumber === item1.itemSerialNumber) {
                              //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>14',item1);
                               tot1 += orders1[j].item.count ;
                                for (var sup1 in orders1[j].suppliers) {
                                    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> suppppppppppppppppppp14',orders1[j].suppliers[sup1]);
                                    if (parseInt(orders1[j].suppliers[sup1]) > 0) {
                                        sumhus1 += parseInt(orders1[j].suppliers[sup1]);
                                        orders[i].supp[sup1][0].husman += parseInt(orders1[j].suppliers[sup1]);
                                    }
                                }
                        }
                    }
                    orders[i].totorder = tot1 ;
                    orders[i].tothaluka = sumhus1 ;
                }
            }
            if (angular.isUndefined(orders)) {
                return;
            }

            vm.tableSummary = {
                count: 0,
                sum: 0
            };

         /*   orders.forEach(function (order) {
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
            }, this);*/
        }, true);

        $scope.$watch('vm.isDistributedMode', function (mode) {
            console.log('reserve component 20');
            if (angular.isUndefined(mode)) {
                vm.pageMode = 'reserve';
                return;
            }
            if (mode) {
                vm.pageMode = 'distributed';
                vm.showDistributedItems();
            } else {
                vm.pageMode = 'reserve';
                vm.filteringTable = true;
                $timeout(function () {
                    vm.showReserveItems();
                }, 0)

            }
        });

        $scope.$watch('vm.refreshData', function (num) {
            console.log('reserve component 21');
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