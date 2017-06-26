(function () {
    'use strict';

    angular
        .module('app')
        .controller('entryScreenController', entryScreenController);

    entryScreenController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location'
    ];

    function entryScreenController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location) {

        var vm = this;

        vm.imagesPath = device.getImagesPath();

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

        document.addEventListener("deviceready", function () {
            device.setAppDir(cordova.file.applicationDirectory);
        }, false);

    }

})();