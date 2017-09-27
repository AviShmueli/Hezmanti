(function() {
    'use strict';

    angular
        .module('app')
        .service('josSiryunContext', josSiryunContext);

        josSiryunContext.$inject = ['$localStorage', 'moment'];

    function josSiryunContext($localStorage, moment) {
        
        var self = this;
        console.log('josSiryunContext service ');
        self.$storage = $localStorage;

        var saveDistributionState = function (state) {
            console.log('josSiryunContext service 1');
            self.$storage.distributionState = state;
        }

        var saveDistributedState = function (state) {
            console.log('josSiryunContext service 2');
            self.$storage.distributedState = state;
        }

        var getDistributionState = function () {
            console.log('josSiryunContext service 3');
            return self.$storage.distributionState;
        }

        var getDistributedState = function () {
            console.log('josSiryunContext service 4');
            return self.$storage.distributedState ||  [];
        }

        var cleanOldDistributedData = function () {
            console.log('josSiryunContext service 5');
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
            console.log('josSiryunContext service 6');
            return self.$storage.lastOrderId ||  0;
        }

        var setLastOrderId = function (val) {
            console.log('josSiryunContext service 7');
            self.$storage.lastOrderId = val;
        }
        

        var service = { 
            saveDistributionState: saveDistributionState,
            saveDistributedState: saveDistributedState,
            getDistributionState: getDistributionState,
            getDistributedState: getDistributedState,
            cleanOldDistributedData: cleanOldDistributedData,
            getLastOrderId: getLastOrderId,
            setLastOrderId: setLastOrderId
        };

        return service;
    }
})();