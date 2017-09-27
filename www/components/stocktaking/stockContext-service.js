(function () {
    'use strict';

    angular
        .module('app')
        .service('stockContext', stockContext);

    stockContext.$inject = ['$rootScope', '$localStorage', 'dataContext'];

    function stockContext($rootScope, $localStorage, dataContext) {
        console.log('stockContext service');
        var self = this;
        self.$storage = $localStorage;
        

        if (self.$storage.stockCatalog === undefined) {
            console.log('stockContext service 1');
            self.$storage.stockCatalog = null;
        }

        if (self.$storage.stock === undefined) {
            console.log('stockContext service 2');
            self.$storage.stock = {};
        }

        var getStock = function () {
            console.log('stockContext service 3');
            return self.$storage.stock || {};
        }

        var updateStock = function (item) {
            console.log('stockContext service 4');
            var stock = getStock();
            if (stock.hasOwnProperty(item._id)) {
                stock[item._id].count = item.count;
                return false;
            } else {
                self.$storage.stock[item._id] = item;
                return true;
            }
        }

        var removeItemFromStock = function (item) {
            console.log('stockContext service 5');
            var stock = self.$storage.stock;
            if (stock.hasOwnProperty(item._id)) {
                delete stock[item._id];
            }
        }

        var getStockCount = function () {
            console.log('stockContext service 6');
            return Object.keys(self.$storage.stock).length;
        }

        var getStockItemsList = function () {
            console.log('stockContext service 7');
            return Object.values(self.$storage.stock);
        }

        var cleanStock = function () {
            console.log('stockContext service 7' );
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
            console.log('stockContext service 8');
            if(self.$storage.stockCatalog === undefined || self.$storage.stockCatalog === null){
                setStockCatalog();
            }
            return self.$storage.stockCatalog;
        }

        var setStockCatalog = function () {
            console.log('stockContext service 9');
            self.$storage.stockCatalog = angular.copy(dataContext.getCatalog());
        }

        var service = {
            removeItemFromStock: removeItemFromStock,
            updateStock: updateStock,
            getStockCount: getStockCount,
            getStockItemsList: getStockItemsList,
            cleanStock: cleanStock,
            getStockCatalog: getStockCatalog,
            setStockCatalog: setStockCatalog
        };

        return service;
    }

})();