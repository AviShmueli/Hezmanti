(function () {
    'use strict';

    angular
        .module('app')
        .controller('StocktakingController', StocktakingController);

    StocktakingController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location'
    ];

    function StocktakingController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location) {

        var vm = this;

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

    }

})();