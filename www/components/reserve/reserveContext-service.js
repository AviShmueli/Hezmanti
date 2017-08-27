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

        var saveDistributedState = function (state) {
            self.$storage.distributedState = state;
        }

        var getReserveState = function () {
            return self.$storage.reserveState;
        }

        var getDistributedState = function () {
            return self.$storage.distributedState ||  [];
        }

        var cleanOldDistributedData = function () {
            var today = moment();
            for (var index = 0; index < self.$storage.distributedState.length; index++) {
                var element = self.$storage.distributedState[index];
                if (today.diff(element.createdDate, 'days') > 2) {
                    lodash.remove(self.$storage.distributedState, function (n) {
                        return n.id === element.id;
                    });
                }
            }
        }

        var getLastOrderId = function () {
            return self.$storage.lastOrderId ||  0;
        }

        var setLastOrderId = function (val) {
            self.$storage.lastOrderId = val;
        }
        

        var service = { 
            saveReserveState: saveReserveState,
            saveDistributedState: saveDistributedState,
            getReserveState: getReserveState,
            getDistributedState: getDistributedState,
            cleanOldDistributedData: cleanOldDistributedData,
            getLastOrderId: getLastOrderId,
            setLastOrderId: setLastOrderId
        };

        return service;
    }
})();