(function () {
    'use strict';

    angular
        .module('app')
        .controller('OrderController', OrderController);

    OrderController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location', '$filter'
    ];

    function OrderController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, $filter) {

        var vm = this;

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

        vm.cardItems = dataContext.getCartItemsList();
        vm.currDate = $filter('date')(new Date(), 'dd/MM');
        vm.showSucseesMessage = false;
        vm.showErrorMessage = false;

        vm.viewMode = 'newOrder';

        vm.cardCount = function () {
            return dataContext.getCartCount();
        }

        vm.switchMode = function(toMode){
            if (toMode === 'new') {
                vm.viewMode = 'newOrder';
                vm.showSucseesMessage = false;
                vm.showErrorMessage = false;
            }

            if (toMode === 'view') {
                vm.viewMode = 'viewOrder';
                vm.showSucseesMessage = false;
                vm.showErrorMessage = false;
                vm.cardItems = dataContext.getCartItemsList();
            }
        }

        vm.sendOrder = function(){
            if (vm.cardItems.length > 0) {
                var itemsOrderList = [];
                for (var index = 0; index < vm.cardItems.length; index++) {
                    var item = vm.cardItems[index];
                    itemsOrderList.push({itemName: item.name, itemSerialNumber: item.serialNumber, count: item.count});
                }

                var order = {
                    branchName: 'רעננה',
                    networkId: '0',
                    branchId: '1',
                    createdDate: new Date(),
                    items:  itemsOrderList
                }

                server.addOrder(order).then(function(response){
                    vm.showSucseesMessage = true;
                    dataContext.cleanCart();
                }, function (error) {
                    vm.showErrorMessage = true;
                });
            }
        }
    }

})();