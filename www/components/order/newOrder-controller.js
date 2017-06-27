(function () {
    'use strict';

    angular
        .module('app')
        .controller('newOrderController', newOrderController);

    newOrderController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location'
    ];

    function newOrderController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location) {

        var vm = this;

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

        vm.cardCount = function(){
            return dataContext.getCartCount();
        }
         /*var currTime = new Date();
        var client = {
            timeZone: (currTime.getTimezoneOffset() / 60) + ' hours',
            OS: device.getOSName(),
            browser: device.getBrowserName(),
            isConnected: true
        };

        var clientId = dataContext.getClientId();
        if (clientId !== null) {
            client['id'] = clientId;
        }

       server.registerNewClient(client).then(function (result) {
            if (result.data !== undefined) {
                vm.client = result.data;
                dataContext.setClientId(vm.client.id);
            }
        }, function (error) {
            $log.error('Error while tying to register new client to the app: ', error);
        });*/


    }

})();