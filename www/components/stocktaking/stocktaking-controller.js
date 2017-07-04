(function () {
    'use strict';

    angular
        .module('app')
        .controller('StocktakingController', StocktakingController);

    StocktakingController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location', 'stockContext'
    ];

    function StocktakingController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, stockContext) {

        var vm = this;

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

        vm.departmentsMap = angular.copy(dataContext.getCatalog());

         vm.itemCountChanged = function (item) {
            if (item.count !== undefined && item.count !== '' && item.count > 0) {
                stockContext.updateCart(item);
            }
            else{
                stockContext.removeItemFromCart(item);
            }
        }

    }

})();