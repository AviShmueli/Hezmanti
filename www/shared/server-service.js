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
                url: '/registerNewClient',
                data: {
                    client: client
                }
            };

            return $http(req);
        }

        var keepMeAlive = function (clientId) {
            var req = {
                method: 'POST',
                url: '/keepMeAlive',
                data: {
                    clientId: clientId
                }
            };

            return $http(req);
        }

        var getAllBranches = function () {
            var req = {
                method: 'GET',
                url: '/getAllBranches'
            };

            return $http(req);
        }

        var getCatalog = function () {
            var req = {
                method: 'GET',
                url: '/getCatalog'
            };

            return $http(req);
        }

        var searchItems = function (searchString) {
            var req = {
                method: 'GET',
                url: '/searchItems',
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