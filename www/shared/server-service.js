(function () {
    'use strict';

    angular
        .module('app')
        .service('server', server);

    server.$inject = ['$http', 'dataContext'];

    function server($http, dataContext) {

        var self = this;

        var getOrder = function (orderId) {
            var req = {
                method: 'GET',
                url: '/api/getOrder',
                params: {
                    orderId: orderId
                }
            };

            return $http(req);
        }

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

        var updateOrder = function (order, items) {
            var req = {
                method: 'POST',
                url: '/api/updateOrder',
                data: {
                    order: order,
                    items: items
                }
            };

            return $http(req);
        }

        var updateUserLastSeenTime = function (id, date) {
            var req = {
                method: 'POST',
                url: '/api/updateUserLastSeenTime',
                data: {
                    id: id,
                    date: date
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

        var getDepartments = function () {
            var req = {
                method: 'GET',
                url: '/api/getDepartments'
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

        var getAllOrders = function (query, filter) {
            var req = {
                method: 'GET',
                url: '/api/getAllOrders',
                params: {
                    order: query.order,
                    limit: query.limit,
                    page: query.page,
                    filter: filter
                }
            };

            return $http(req);
        }

        var getAllOrdersCount = function (filter) {
            var req = {
                method: 'GET',
                url: '/api/getAllOrdersCount',
                params: {
                    filter: filter
                }
            };

            return $http(req);
        }

        var checkBranchCode = function (code) {
            var req = {
                method: 'GET',
                url: '/api/checkBranchCode',
                params: {
                    code: code
                }
            };

            return $http(req);
        }

        var getAllTodayOrders = function () {
            var req = {
                method: 'GET',
                url: '/api/getAllTodayOrders'
            };

            return $http(req);
        }

        var saveDistribution = function (distributionList) {
            var req = {
                method: 'POST',
                url: '/api/saveDistribution',
                data: {
                    distributionList: distributionList
                }
            };

            return $http(req);
        }

        var getSuppliers = function () {
            var req = {
                method: 'GET',
                url: '/api/getSuppliers'
            };

            return $http(req);
        }

        var service = {
            addOrder: addOrder,
            getCatalog: getCatalog,
            getAllBranches: getAllBranches,
            searchItems: searchItems,
            getAllOrders: getAllOrders,
            getOrder: getOrder,
            updateOrder: updateOrder,
            getAllOrdersCount: getAllOrdersCount,
            checkBranchCode: checkBranchCode,
            getDepartments: getDepartments,
            updateUserLastSeenTime: updateUserLastSeenTime,
            getAllTodayOrders: getAllTodayOrders,
            saveDistribution: saveDistribution,
            getSuppliers: getSuppliers
        };

        return service;
    }

})();