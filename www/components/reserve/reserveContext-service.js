(function() {
    'use strict';

    angular
        .module('app')
        .service('reserveContext', reserveContext);

    reserveContext.$inject = ['$localStorage', 'moment'];

    function reserveContext($localStorage, moment) {
        var self = this;
        self.$storage = $localStorage;

        var saveReserveState = function (state) {
            self.$storage.reserveState = state;
        }

        var getDistributionState = function () {
            return self.$storage.distributionState;
        }



        var saveDistributedState = function (state) {
            self.$storage.distributedState = state;
        }

        var getReserveState = function () {
          //  self.$storage.reserveState =[];
            return self.$storage.reserveState;
        }

        var service = { 
            saveReserveState: saveReserveState,
            saveDistributedState: saveDistributedState,
            getReserveState: getReserveState,
            getDistributionState: getDistributionState
        };

        return service;
    }
})();