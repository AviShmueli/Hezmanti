(function() {
    'use strict';

    angular
        .module('app')
        .service('distributionContext', distributionContext);

    distributionContext.$inject = ['$localStorage'];

    function distributionContext($localStorage) {
        
        var self = this;
        self.$storage = $localStorage;

        var saveDistributionState = function (state) {
            self.$storage.distributionState = state;
        }

        var getDistributionState = function () {
            return self.$storage.distributionState;
        }

        var getDistributedState = function () {
            return self.$storage.distributedState ||  [];
        }
        

        var service = { 
            saveDistributionState: saveDistributionState,
            getDistributionState: getDistributionState,
            getDistributedState: getDistributedState
        };

        return service;
    }
})();