(function () {
    'use strict';

    angular
        .module('app')
        .controller('OrderController', OrderController);

    OrderController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location', '$filter',
        'stockContext'
    ];

    function OrderController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, $filter,
        stockContext) {

        var vm = this;
            console.log('OrderController');
        vm.navigateTo = function (to) {
            console.log('OrderController 1',to);
            $location.path('/' + to);
        }

        vm.pageMode = $state.params.mode;

        vm.user = dataContext.getUser();

        vm.cartItems = dataContext.getCartItemsList();
        vm.showSucseesMessage = false;
        vm.showErrorMessage = false;
        vm.sendingOrder = false;
        vm.isSecondOrder = false;

        vm.viewMode = 'newOrder';

        var initCartItems = function () {
            console.log('OrderController 2');
            if (vm.pageMode === 'order') {
                vm.cartItems = dataContext.getCartItemsList();
            }
            if (vm.pageMode === 'stock') {
                vm.cartItems = stockContext.getStockItemsList();
            }
        };

        initCartItems();

        vm.cleanData = function () {
            console.log('OrderController 3');
            if (vm.pageMode === 'order') {
                dataContext.cleanCart();
            }
            if (vm.pageMode === 'stock') {
                stockContext.cleanStock();
            }
        }

        vm.cardCount = function () {
            console.log('#################OrderController 4',vm.pageMode);
            if (vm.pageMode === 'order') {
                console.log('#################OrderController 4444444444444',dataContext.getCartCount());
                return dataContext.getCartCount();
            }
            if (vm.pageMode === 'stock') {
                return stockContext.getStockCount();
            }
        }

        if (vm.pageMode === 'order') {
            vm.catalog = dataContext.getCatalog();
        }
        if (vm.pageMode === 'stock') {
            vm.catalog = stockContext.getStockCatalog();
        }

        vm.switchMode = function (toMode) {
            console.log('OrderController 5',toMode);
            if (toMode === 'new') {
                vm.viewMode = 'newOrder';
                vm.showSucseesMessage = false;
                vm.showErrorMessage = false;
            }

            if (toMode === 'view') {
                vm.viewMode = 'viewOrder';
                vm.showSucseesMessage = false;
                vm.showErrorMessage = false;
                initCartItems();
            }
        }

        vm.itemCountChanged = function (item) {
            console.log('OrderController 6');
            if (item.count !== undefined && item.count !== '' && item.count > 0) {
                if (vm.pageMode === 'order') {
                    return dataContext.updateCart(item);
                }
                if (vm.pageMode === 'stock') {
                    return stockContext.updateStock(item);
                }
            } else {
                if (vm.pageMode === 'order') {
                    dataContext.removeItemFromCart(item);
                }
                if (vm.pageMode === 'stock') {
                    stockContext.removeItemFromStock(item);
                }
            }
        }

        vm.sendOrder = function () {
            console.log('OrderController 7');
            if (vm.cartItems.length > 0) {
                vm.sendingOrder = true;
                var itemsOrderList = [];
                for (var index = 0; index < vm.cartItems.length; index++) {
                    var item = vm.cartItems[index];
                    itemsOrderList.push({
                        itemName: item.name,
                        itemSerialNumber: item.serialNumber,
                        itemDepartmentId: item.departmentId,
                        unit: item.unit,
                        count: item.count
                    });
                }

                var order = {
                    branchName: vm.user.branch.name,
                    networkId: vm.user.branch.networkId,
                    networkName: vm.user.branch.networkName,
                    branchId: vm.user.branch.serialNumber,
                    createdDate: new Date(),
                    createdBy: vm.user.name,
                    items: itemsOrderList,
                    type: vm.isSecondOrder ? 'secondOrder' : vm.pageMode
                }

                server.addOrder(order).then(function (response) {
                    vm.showSucseesMessage = true;
                    vm.sendingOrder = false;
                    vm.cleanData();
                }, function (error) {
                    vm.sendingOrder = false;
                    vm.showErrorMessage = true;
                });
            }
        }

        var getDeliveryDate = function () {
            console.log('OrderController 8');
            var day = new Date().getDay();
            var deliveryDate = new Date();
            if (day === 5) {
                deliveryDate.setDate(deliveryDate.getDate() + 2);
            } else {
                deliveryDate.setDate(deliveryDate.getDate() + 1);
            }
            return $filter('date')(deliveryDate, 'dd/MM');
        }

        var orderText = {
            sendBTN: "שלח הזמנה",
            viewBTN: "הצג הזמנה",
            title: "הזמנה",
            viewTitle: 'הזמנה לתאריך',
            sucsessMessage: 'ההזמנה נשלחה בהצחלה !',
            errorMessage: 'אירעה שגיאה בשליחת ההזמנה !'
        };

        var stockText = {
            sendBTN: "שלח מלאי",
            viewBTN: "הצג מלאי",
            title: "דיווח מלאי",
            viewTitle: 'מלאי לתאריך',
            sucsessMessage: 'דיווח המלאי נשלח בהצחלה !',
            errorMessage: 'אירעה שגיאה בשליחת הדיווח !'
        };

        vm.pageText = (vm.pageMode === 'order') ? orderText : stockText;
        vm.currDate = (vm.pageMode === 'order') ? getDeliveryDate() : $filter('date')(new Date(), 'dd/MM');


        /*
        $rootScope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };*/
    }

})();