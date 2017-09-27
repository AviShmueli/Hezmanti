(function() {
    'use strict';

    angular
        .module('app')
        .service('reserveContext', reserveContext);

    reserveContext.$inject = ['$localStorage', 'moment'];

    function reserveContext($localStorage, moment) {
        console.log('reserveContext service');
        var self = this;
        self.$storage = $localStorage;

        var saveReserveState = function (state) {
            console.log('==========================SAVE was call===');
            self.$storage.reserveState = state;
        }

        var getDistributionState = function () {
           // console.log('distribution service 4',self.$storage.distributionState);
            return self.$storage.distributionState;
        }



        var saveDistributedState = function (state) {
            self.$storage.distributedState = state;
        }

        var getReserveState = function () {
          //  self.$storage.reserveState =[];
            console.log('=================================getReserveState===',self.$storage.reserveState);
            return self.$storage.reserveState;
        }

     //   var getDistributedState = function () {
       //     console.log('==============================getDistributedState===',self.$storage.distributedState)
     //       return self.$storage.distributedState ||  [];
      //  }

     /*   var cleanOldDistributedData = function () {
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
*/
     //   var getLastOrderId = function () {
     //       return self.$storage.lastOrderId ||  0;
     //   }

     //   var setLastOrderId = function (val) {
     //       self.$storage.lastOrderId = val;
     //   }
        

        var service = { 
            saveReserveState: saveReserveState,
            saveDistributedState: saveDistributedState,
            getReserveState: getReserveState,
            getDistributionState: getDistributionState
         //   getDistributedState: getDistributedState
         //   cleanOldDistributedData: cleanOldDistributedData,
         //   getLastOrderId: getLastOrderId,
         //   setLastOrderId: setLastOrderId
        };

        return service;
    }
})();