(function () {
    'use strict';

    angular
        .module('app')
        .service('server', server);

    server.$inject = ['$http', 'dataContext'];

    function server($http, dataContext) {

        var self = this;
        console.log("server-services");
        var getOrder = function (orderId) {
            console.log("server-services 1");
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
            console.log("server-services 2");
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
            console.log("server-services 3");
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
            console.log("server-services 4");
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
            console.log("server-services 5");
            var req = {
                method: 'GET',
                url: '/api/getAllBranches'
            };

            return $http(req);
        }

        var getDepartments = function () {
            console.log("server-services 6");
            var req = {
                method: 'GET',
                url: '/api/getDepartments'
            };

            return $http(req);
        }

        var getCatalog = function () {
            console.log("server-services 7");
            var req = {
                method: 'GET',
                url: '/api/getCatalog'
            };

            return $http(req);
        }

        var searchItems = function (searchString) {
            console.log("server-services 8");
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
            console.log("server-services 9 query=",query,"  filter=",filter);
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
            console.log("server-services 10");
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
            console.log("server-services 11");
            var req = {
                method: 'GET',
                url: '/api/checkBranchCode',
                params: {
                    code: code
                }
            };
            console.log("server-services 11 req=",req);
            return $http(req);
        }

        var getAllTodayOrders = function () {
            console.log("server-services 12");
            var req = {
                method: 'GET',
                url: '/api/getAllTodayOrders'
            };

            return $http(req);
        }

        var saveDistribution = function (distributionList) {
            console.log("server-services 13");
            var req = {
                method: 'POST',
                url: '/api/saveDistribution',
                data: {
                    distributionList: JSON.stringify(distributionList)
                }
            };

            return $http(req);
        }

        var getSuppliers = function () {
            console.log("server-services 14");
            var req = {
                method: 'GET',
                url: '/api/getSuppliers'
            };

            return $http(req);
        }

        var addSupplier = function (supplier) {
            console.log("server-services 15");
            var req = {
                method: 'POST',
                url: '/api/addSupplier',
                data: {
                    supplier: supplier
                }
            };

            return $http(req);
        }

        var updateSupplier = function (supplier) {
            console.log("server-services 16");
            var req = {
                method: 'POST',
                url: '/api/addSupplier',
                data: {
                    supplier: supplier
                }
            };

            return $http(req);
        }

        var editDepartment = function (department) {
            console.log("server-services 17");
            var req = {
                method: 'POST',
                url: '/api/editDepartment',
                data: {
                    department: department
                }
            };

            return $http(req);
        }

        var markItemsAsDistrebuted = function (items) {
            console.log("server-services 18");
            var req = {
                method: 'POST',
                url: '/api/markItemsAsDistrebuted',
                data: {
                    items: items
                }
            };

            return $http(req);
        }

        var getDistributedItems = function (filter) {
            console.log("server-services 19");
            var req = {
                method: 'GET',
                url: '/api/getDistributedItems',
                params: {
                    filter: filter
                }
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
            getSuppliers: getSuppliers,
            addSupplier: addSupplier,
            updateSupplier: updateSupplier,
            editDepartment: editDepartment,
            markItemsAsDistrebuted: markItemsAsDistrebuted,
            getDistributedItems: getDistributedItems
        };

        return service;
    }

})();