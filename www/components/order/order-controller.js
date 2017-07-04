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

        vm.user = dataContext.getUser();
        vm.cardItems = dataContext.getCartItemsList();
        vm.currDate = $filter('date')(new Date(), 'dd/MM');
        vm.showSucseesMessage = false;
        vm.showErrorMessage = false;
        vm.sendingOrder = false;

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
                vm.sendingOrder = true;
                var itemsOrderList = [];
                for (var index = 0; index < vm.cardItems.length; index++) {
                    var item = vm.cardItems[index];
                    itemsOrderList.push({
                        itemName: item.name, 
                        itemSerialNumber: item.serialNumber, 
                        itemDepartmentId: item.departmentId,
                        unit: item.unit,
                        count: item.count});
                }

                var order = {
                    branchName: vm.user.branch.name,
                    networkId: vm.user.branch.networkId,
                    networkName: vm.user.branch.networkName,
                    branchId: vm.user.branch.serialNumber,
                    createdDate: new Date(),
                    createdBy: vm.user.name,
                    items:  itemsOrderList
                }

                server.addOrder(order).then(function(response){
                    vm.showSucseesMessage = true;
                    vm.sendingOrder = false;
                    dataContext.cleanCart();
                }, function (error) {
                    vm.sendingOrder = false;
                    vm.showErrorMessage = true;
                });
            }
        }
    }

})();