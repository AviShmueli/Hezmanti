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

        if (self.$storage.networksBranchesMap === undefined) {
            self.$storage.networksBranchesMap = null;
        }

        var getCart = function(){
            return self.$storage.cart || {};
        }

        var updateCart = function(item){
            var card = getCart();
            if (card.hasOwnProperty(item._id)) {
                card[item._id].count = item.count;
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

        var getCartItemsList = function(){
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

        var getNetworksBranchesMap = function(){
            return self.$storage.networksBranchesMap;
        }

        var setNetworksBranchesMap = function(networksBranchesMap){
            self.$storage.networksBranchesMap = networksBranchesMap;
        }

        var service = {
            removeItemFromCart: removeItemFromCart,
            updateCart: updateCart,
            getCartCount: getCartCount,
            getCartItemsList: getCartItemsList,
            cleanCart: cleanCart,
            setCatalog: setCatalog,
            getCatalog: getCatalog,
            getBranches: getBranches,
            setBranches: setBranches,
            getNetworks: getNetworks,
            setNetworks: setNetworks,
            getNetworksBranchesMap: getNetworksBranchesMap,
            setNetworksBranchesMap: setNetworksBranchesMap
        };

        return service;
    }

})();