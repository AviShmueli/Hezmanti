(function () {
    'use strict';

    angular
        .module('app')
        .component('newOrder', {
            bindings: {
                client: '=',
            },
            controller: newOrderController,
            controllerAs: 'vm',
            templateUrl: 'components/order/newOrder-template.html'
        });

    function newOrderController($scope, dataContext, $location, server) {

        var vm = this;

        vm.navigateTo = function (to) {
            $location.path('/' + to);
        }

        vm.departmentsMap = dataContext.getCatalog();

        if (!vm.departmentsMap) {
            server.getCatalog().then(function (response) {
                vm.items = response.data;
                vm.departmentsMap = {};
                for (var index = 0; index < response.data.length; index++) {
                    var item = response.data[index];
                    if (!vm.departmentsMap.hasOwnProperty(item.departmentId)) {
                        vm.departmentsMap[item.departmentId] = [];
                    }
                    vm.departmentsMap[item.departmentId].push(item);
                }
                dataContext.setCatalog(vm.departmentsMap);
            });
        }

        vm.itemCountChanged = function (item) {
            if (item.count !== undefined && item.count !== '' && item.count > 0) {
                dataContext.updateCart(item);
            }
            else{
                dataContext.removeItemFromCart(item);
            }
        }

    }

})();