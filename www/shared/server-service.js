(function () {
    'use strict';

    angular
        .module('app')
        .service('server', server);

    server.$inject = ['$http', 'dataContext'];

    function server($http, dataContext) {

        var self = this;

        var registerNewClient = function (client) {
            var req = {
                method: 'POST',
                url: '/api/registerNewClient',
                data: {
                    client: client
                }
            };

            return $http(req);
        }

        var keepMeAlive = function (clientId) {
            var req = {
                method: 'POST',
                url: '/api/keepMeAlive',
                data: {
                    clientId: clientId
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

        var service = {
            registerNewClient: registerNewClient,
            keepMeAlive: keepMeAlive,
             getCatalog: getCatalog,
            getAllBranches: getAllBranches,
            searchItems: searchItems
        };

        return service;
    }

})();