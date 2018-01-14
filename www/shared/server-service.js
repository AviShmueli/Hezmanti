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


        // #############jos add######################################
        var insertSiryun = function (siryun) {
            var req = {
                method: 'POST',
                url: '/api/insertSiryun',
                data: {
                    siryun: siryun
                }
            };

            return $http(req);
        }
        var insertSiryunOrder = function (siryun) {
            var req = {
                method: 'POST',
                url: '/api/insertSiryunOrder',
                data: {
                    siryun: siryun
                }
            };

            return $http(req);
        }

        var getSiryun = function (cre_date) {
            var req = {
                method: 'GET',
                url: '/api/getSiryun',
                params: {
                    cre_date: cre_date
                }
            };

            return $http(req);
        }
        var getSiryunOrder = function (cre_date) {
            var req = {
                method: 'GET',
                url: '/api/getSiryunOrder',
                params: {
                    cre_date: cre_date
                }
            };

            return $http(req);
        }
        var getJosOrders = function (cre_date,fromOrder) {
            var req = {
                method: 'GET',
                url: '/api/getJosOrders',
                params: {
                    cre_date: cre_date,
                    fromOrder: fromOrder
                }
            };

            return $http(req);
        }
        var updateSiryun = function (siryun, cre_date) {
            var req = {
                method: 'POST',
                url: '/api/updateSiryun',
                data: {
                    siryun: siryun,
                    cre_date: cre_date
                }
            };

            return $http(req);
        }
        var updateSiryunOrder = function (siryun, cre_date) {
            var req = {
                method: 'POST',
                url: '/api/updateSiryunOrder',
                data: {
                    siryun: siryun,
                    cre_date: cre_date
                }
            };

            return $http(req);
        }

        

        // #############jos add######################################


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
                    distributionList: JSON.stringify(distributionList)
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

        var addSupplier = function (supplier) {
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

            
            insertSiryun: insertSiryun,
            insertSiryunOrder: insertSiryunOrder,
            getSiryun: getSiryun,
            getSiryunOrder: getSiryunOrder,
            getJosOrders: getJosOrders,
            updateSiryun: updateSiryun,
            updateSiryunOrder: updateSiryunOrder,
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