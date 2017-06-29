(function () {
    'use strict';

    angular
        .module('app')
        .service('dataContext', dataContext);

    dataContext.$inject = ['$rootScope', '$localStorage'];

    function dataContext($rootScope, $localStorage) {

        var self = this;
        self.$storage = $localStorage;

        if (self.$storage.cart === undefined) {
            self.$storage.cart = {};
        }

        if (self.$storage.catalog === undefined) {
            self.$storage.catalog = null;
        }

        if (self.$storage.branches === undefined) {
            self.$storage.branches = null;
        }

        if (self.$storage.networks === undefined) {
            self.$storage.networks = null;
        }

        var getCart = function(){
            return self.$storage.cart || {};
        }

        var updateCart = function(item){
            var card = getCard();
            if (card.hasOwnProperty(item._id)) {
                card[item._id].count += item.count;
                return false;
            }
            else{
                self.$storage.cart[item._id] = item;
                return true;
            }
        }

        var removeItemFromCart = function (item) {
            var card = self.$storage.cart;
            if (card.hasOwnProperty(item._id)) {
                delete card[item._id];
            }
        }

        var getCartCount = function(){
            return Object.keys(self.$storage.cart).length;
        }

        var getCardItemsList = function(){
            return Object.values(self.$storage.cart);
        }

        var cleanCart = function(){
            self.$storage.cart = {};
        }
        
        var setCatalog = function(ctalog){
            self.$storage.catalog = ctalog;
        }

        var getCatalog = function(){
            return self.$storage.catalog;
        }

        var getBranches = function(){
            return self.$storage.branches;
        }

        var setBranches = function(branches){
            self.$storage.branches = branches;
        }

        var getNetworks = function(){
            return self.$storage.networks;
        }

        var setNetworks = function(networks){
            self.$storage.networks = networks;
        }

        var service = {
            removeItemFromCart: removeItemFromCart,
            updateCart: updateCart,
            getCartCount: getCartCount,
            getCardItemsList: getCardItemsList,
            cleanCart: cleanCart,
            setCatalog: setCatalog,
            getCatalog: getCatalog,
            getBranches: getBranches,
            setBranches: setBranches,
            getNetworks: getNetworks,
            setNetworks: setNetworks
        };

        return service;
    }

})();