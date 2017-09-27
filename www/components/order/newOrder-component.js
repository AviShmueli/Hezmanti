(function () {
    'use strict';

    angular
        .module('app')
        .component('newOrder', {
            bindings: {
                catalog: '=',
                itemCountChanged: '=',
                pageMode: '='
            },
            controller: newOrderController,
            controllerAs: 'vm',
            templateUrl: 'components/order/newOrder-template.html'
        });

    function newOrderController($scope, dataContext, $location, server) {

        var vm = this;
        console.log('newOrder component');
        vm.navigateTo = function (to) {
            $location.path('/' + to);
        }

    }

})();