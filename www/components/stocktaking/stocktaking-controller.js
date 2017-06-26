(function () {
    'use strict';

    angular
        .module('app')
        .controller('stocktakingController', stocktakingController);

    stocktakingController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location'
    ];

    function stocktakingController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location) {

        var vm = this;

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

    }

})();