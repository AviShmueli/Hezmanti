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

        vm.navigateTo = function (to) {
            $location.path('/' + to);
        }

        vm.pageMode = $state.params.mode;

        vm.user = dataContext.getUser();

        vm.cartItems = dataContext.getCartItemsList();
        vm.currDate = $filter('date')(new Date(), 'dd/MM');
        vm.showSucseesMessage = false;
        vm.showErrorMessage = false;
        vm.sendingOrder = false;

        vm.viewMode = 'newOrder';

        var initCartItems = function () {
            if (vm.pageMode === 'order') {
                vm.cartItems = dataContext.getCartItemsList();
            }
            if (vm.pageMode === 'stock') {
                vm.cartItems = stockContext.getStockItemsList();
            }
        };

        initCartItems();

        var cleanData = function () {
            if (vm.pageMode === 'order') {
                dataContext.cleanCart();
            }
            if (vm.pageMode === 'stock') {
                stockContext.cleanStock();
            }
        }

        vm.cardCount = function () {
            if (vm.pageMode === 'order') {
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
            if (item.count !== undefined && item.count !== '' && item.count > 0) {
                if (vm.pageMode === 'order') {
                    dataContext.updateCart(item);
                }
                if (vm.pageMode === 'stock') {
                    stockContext.updateStock(item);
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
                    items: itemsOrderList
                }

                server.addOrder(order).then(function (response) {
                    vm.showSucseesMessage = true;
                    vm.sendingOrder = false;
                    cleanData();
                }, function (error) {
                    vm.sendingOrder = false;
                    vm.showErrorMessage = true;
                });
            }
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
            sucsessMessage: 'דיווח הלמאי נשלח בהצחלה !',
            errorMessage: 'אירעה שגיאה בשליחת הדיווח !'
        };

        vm.pageText = (vm.pageMode === 'order') ? orderText : stockText;

    }

})();