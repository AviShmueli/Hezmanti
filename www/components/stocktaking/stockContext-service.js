(function () {
    'use strict';

    angular
        .module('app')
        .service('stockContext', stockContext);

    stockContext.$inject = ['$rootScope', '$localStorage', 'dataContext'];

    function stockContext($rootScope, $localStorage, dataContext) {

        var self = this;
        self.$storage = $localStorage;
        

        if (self.$storage.stock === undefined) {
            self.$storage.stock = {};
        }

        var getStock = function () {
            return self.$storage.stock || {};
        }

        var updateStock = function (item) {
            var card = getStock();
            if (card.hasOwnProperty(item._id)) {
                card[item._id].count = item.count;
                return false;
            } else {
                self.$storage.stock[item._id] = item;
                return true;
            }
        }

        var removeItemFromStock = function (item) {
            var card = self.$storage.stock;
            if (card.hasOwnProperty(item._id)) {
                delete card[item._id];
            }
        }

        var getStockCount = function () {
            return Object.keys(self.$storage.stock).length;
        }

        var getStockItemsList = function () {
            return Object.values(self.$storage.stock);
        }

        var cleanStock = function () {
            self.$storage.stock = {};
            var catalog = self.$storage.stockCatalog;
            for (var department in catalog) {
                if (catalog.hasOwnProperty(department)) {
                    for (var index = 0; index < catalog[department].length; index++) {
                        var item = catalog[department][index];
                        item.count = '';                     
                    }
                }
            }
        }

        var getStockCatalog = function () {
            if(self.$storage.stockCatalog === undefined){
                self.$storage.stockCatalog = angular.copy(dataContext.getCatalog());
            }
            return self.$storage.stockCatalog;
        }

        var service = {
            removeItemFromStock: removeItemFromStock,
            updateStock: updateStock,
            getStockCount: getStockCount,
            getStockItemsList: getStockItemsList,
            cleanStock: cleanStock,
        };

        return service;
    }

})();