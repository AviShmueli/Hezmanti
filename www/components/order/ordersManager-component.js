(function () {
    'use strict';

    angular
        .module('app')
        .component('ordersManager', {
            bindings: {
                client: '=',
            },
            controller: ordersManagerController,
            controllerAs: 'vm',
            templateUrl: 'components/order/ordersManager-template.html'
        });

    function ordersManagerController(server, $q) {

        var vm = this;

        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';
        vm.toggleFilterSection = function () {
            //var svgMorpheus = new SVGMorpheus('#expand_more_icon svg');
            if (vm.showTasksFilter === true) {
                vm.showTasksFilter = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showTasksFilter = true;
                vm.expand_icon = 'expand_less';
            }
        }

        var deferred = $q.defer();
        vm.promise = deferred.promise;

        server.getAllOrders().then(function(response){
            vm.orders = response.data;
            deferred.resolve();
        })

    }

}());