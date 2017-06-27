(function () {
    'use strict';

    angular
        .module('app')
        .controller('viewOrderController', viewOrderController);

    viewOrderController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location', '$filter'
    ];

    function viewOrderController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, $filter) {

        var vm = this;

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

        vm.cardItems = dataContext.getCardItemsList();
        vm.currDate = $filter('date')(new Date(), 'dd/MM');
        vm.showSucseesMessage = false;
        vm.showErrorMessage = false;

        vm.sendOrder = function(){
            if (vm.cardItems.length > 0) {
                var itemsOrderList = [];
                for (var index = 0; index < vm.cardItems.length; index++) {
                    var item = vm.cardItems[index];
                    itemsOrderList.push({itemName: item.name, itemSerialNumber: item.serialNumber, count: item.count});
                }

                var order = {
                    branchName: 'רעננה',
                    branchId: '1',
                    createdDate: new Date(),
                    items:  itemsOrderList
                }

                server.addOrder(order).then(function(response){
                    vm.showSucseesMessage = true;
                    dataContext.cleanCard();
                }, function (error) {
                    vm.showErrorMessage = true;
                });
            }
        }
    }

})();