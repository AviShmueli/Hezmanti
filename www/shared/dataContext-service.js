(function () {
    'use strict';

    angular
        .module('app')
        .service('dataContext', dataContext);

    dataContext.$inject = ['$rootScope', '$localStorage'];

    function dataContext($rootScope, $localStorage) {

        var self = this;
        self.$storage = $localStorage;

        if (self.$storage.card === undefined) {
            self.$storage.card = {};
        }

        var getCard = function(){
            return self.$storage.card || {};
        }

        var updateCard = function(item){
            //var card = getCard();
            // if (card.hasOwnProperty(item._id)) {
            //     card[item._id] = item;
            // }
            // else{
                self.$storage.card[item._id] = item;
            // }
        }

        var removeItemFromCard = function (item) {
            var card = self.$storage.card;
            if (card.hasOwnProperty(item._id)) {
                delete card[item._id];
            }
        }

        var getCartCount = function(){
            return Object.keys(self.$storage.card).length;
        }

        var getCardItemsList = function(){
            return Object.values(self.$storage.card);
        }

        var cleanCard = function(){
            self.$storage.card = {};
        }
        

        var service = {
            removeItemFromCard: removeItemFromCard,
            updateCard: updateCard,
            getCartCount: getCartCount,
            getCardItemsList: getCardItemsList,
            cleanCard: cleanCard
        };

        return service;
    }

})();