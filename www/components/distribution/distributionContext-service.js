(function() {
    'use strict';

    angular
        .module('app')
        .service('distributionContext', distributionContext);

    distributionContext.$inject = ['$localStorage', 'moment'];

    function distributionContext($localStorage, moment) {
        
        var self = this;
        self.$storage = $localStorage;

        console.log('distribution service 1');
        var saveDistributionState = function (state) {
            console.log('distribution service 2',state);
            self.$storage.distributionState = state;
        }

        var saveDistributedState = function (state) {
            console.log('distribution service 3',state);
            self.$storage.distributedState = state;
        }

        var getDistributionState = function () {
            console.log('distribution service 4',self.$storage.distributionState);
            return self.$storage.distributionState;
        }

        var getDistributedState = function () {
            console.log('distribution service 5',self.$storage.distributedState);
            return self.$storage.distributedState ||  [];
        }

        var cleanOldDistributedData = function () {
            var today = moment();
            console.log('distribution service 6',today);
            
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
            console.log('distribution service 7',self.$storage.lastOrderId );
            return self.$storage.lastOrderId ||  0;
        }

        var setLastOrderId = function (val) {
            console.log('distribution service 8',val);
            self.$storage.lastOrderId = val;
        }
        
        var getReserveState = function () {
            //  self.$storage.reserveState =[];
              console.log('=================================getReserveState===',self.$storage.reserveState);
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