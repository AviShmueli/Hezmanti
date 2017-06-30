(function () {
    'use strict';

    angular
        .module('app')
        .component('viewOrder', {
            bindings: {
                items: '=',
                orderTitle: '=',
                orderChanged: '=',
                updateOrder: '='
            },
            controller: viewOrderController,
            controllerAs: 'vm',
            templateUrl: 'components/order/viewOrder-template.html'
        });

    function viewOrderController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, $filter) {

        var vm = this;
        vm.editMode = false;
        vm.buttonIcon = 'edit';

        vm.navigateTo = function (to) {
            $location.path('/' + to);
        }

        vm.switchMode = function () {
            if (vm.editMode) {
                updateOrder();
                //vm.items =  dataContext.getCartItemsList();
                vm.editMode = false;
                vm.buttonIcon = 'edit';
            } else {
                vm.editMode = true;
                vm.buttonIcon = 'done';
            }
        }

        var updateOrder = function name(params) {
            //if in admin page go to server and update order 
            if (vm.updateOrder) {
                vm.updateOrder();
            }
        };

        vm.itemCountChanged = function (item) {
            if (vm.orderChanged) {
                vm.orderChanged(item);
            } 
            else {
                if (item.count !== undefined && item.count !== '' && item.count > 0) {
                    var isNew = dataContext.updateCart(item);
                    if (isNew) {
                        vm.items.push(item);
                    }
                } else {
                    dataContext.removeItemFromCart(item);
                }
            }
        }
    }

})();