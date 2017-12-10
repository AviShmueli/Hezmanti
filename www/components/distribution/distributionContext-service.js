(function() {
    'use strict';

    angular
        .module('app')
        .service('distributionContext', distributionContext);

    distributionContext.$inject = ['$localStorage', 'moment'];

    function distributionContext($localStorage, moment) {
        
        var self = this;
        self.$storage = $localStorage;

        var saveDistributionState = function (state) {
            self.$storage.distributionState = state;
        }

        var saveDistributedState = function (state) {
            self.$storage.distributedState = state;
        }

        var getDistributionState = function () {
            return self.$storage.distributionState;
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
        
        var getReserveState = function () {
            //  self.$storage.reserveState =[];
              return self.$storage.reserveState;
          }






        var service = { 
            saveDistributionState: saveDistributionState,
            saveDistributedState: saveDistributedState,
            getDistributionState: getDistributionState,
            getDistributedState: getDistributedState,
            cleanOldDistributedData: cleanOldDistributedData,
            getReserveState: getReserveState,
            getLastOrderId: getLastOrderId,
            setLastOrderId: setLastOrderId
        };

        return service;
    }
})();