(function () {
    'use strict';

    angular
        .module('app')
        .service('server', server);

    server.$inject = ['$http', 'dataContext'];

    function server($http, dataContext) {

        var self = this;

        var addOrder = function (order) {
            var req = {
                method: 'POST',
                url: '/api/addOrder',
                data: {
                    order: order
                }
            };

            return $http(req);
        }

        var getAllBranches = function () {
            var req = {
                method: 'GET',
                url: '/api/getAllBranches'
            };

            return $http(req);
        }

        var getCatalog = function () {
            var req = {
                method: 'GET',
                url: '/api/getCatalog'
            };

            return $http(req);
        }

        var searchItems = function (searchString) {
            var req = {
                method: 'GET',
                url: '/api/searchItems',
                params: {
                    searchString:  searchString
                }
            };

            return $http(req);
        }

        var getAllOrders = function () {
            var req = {
                method: 'GET',
                url: '/api/getAllOrders'
            };

            return $http(req);
        }

        var service = {
            addOrder: addOrder,
            getCatalog: getCatalog,
            getAllBranches: getAllBranches,
            searchItems: searchItems,
            getAllOrders: getAllOrders
        };

        return service;
    }

})();