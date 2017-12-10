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

        if (self.$storage.user === undefined) {
            self.$storage.user = {};
        }

        if (self.$storage.departments === undefined) {
            self.$storage.departments = null;
        }

        var cleanLocalstorage = function () {
            $localStorage.$reset();
        }

        var getCart = function () {
            return self.$storage.cart || {};
        }

        var updateCart = function (item) {
            
            var card = getCart();
            if (card.hasOwnProperty(item._id)) {
                card[item._id].count = item.count;
                return false;
            } else {
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
//https://hezmanti.loggly.com/search#terms=&from=2017-07-04T05%3A03%3A26.992Z&until=2017-07-04T06%3A03%3A26.992Z&source_group=
// avi
// Avi3011algo
        var getCartCount = function () {
            return Object.keys(self.$storage.cart).length;
        }

        var getCartItemsList = function () {
            // TODO: replace Object.values !!!!
            // return Object.values(self.$storage.cart);
            var allValues = [];
            var cart = self.$storage.cart;
            for (var key in cart) {
                if (cart.hasOwnProperty(key)) {
                    var val = cart[key];
                    allValues.push(val);
                }
            }
            return allValues;
        }

        var cleanCart = function () {
            self.$storage.cart = {};
            var catalog = self.$storage.catalog;
            for (var department in catalog) {
                if (catalog.hasOwnProperty(department)) {
                    for (var index = 0; index < catalog[department].length; index++) {
                        var item = catalog[department][index];
                        item.count = '';
                    }
                }
            }
        }

        var setCatalog = function (ctalog) {

            setLastCatalogRefresh(new Date().toISOString());
        }

        var getCatalog = function () {
            return self.$storage.catalog;
        }

        var getBranches = function () {
            return self.$storage.branches;
        }

        var setBranches = function (branches) {
            self.$storage.branches = branches;
        }

        var getNetworks = function () {
            return self.$storage.networks;
        }

        var setNetworks = function (networks) {
            self.$storage.networks = networks;
        }
        
        var getNetworksBranchesMap = function () {
            return self.$storage.networksBranchesMap;
        }

        var setNetworksBranchesMap = function (networksBranchesMap) {
            self.$storage.networksBranchesMap = networksBranchesMap;
        }

        var getUser = function () {
            return self.$storage.user;
        }

        var setUserName = function (userName) {
            self.$storage.user.name = userName;
        }

        var setUserBranch = function (branch) {
            self.$storage.user.branch = branch;
        }

        var getDepartments = function () {
            // var departments = self.$storage.departments;
            // if (!departments) {
            //     var catalog = getCatalog();              
            //     var allCatalogList = Object.values(catalog);
            //     var departmentsList = [];
            //     for (var index = 0; index < allCatalogList.length; index++) {
            //         var elements = allCatalogList[index];
            //         departmentsList.push({
            //             id: elements[0].departmentId,
            //             name: elements[0].departmentName
            //         });
            //     }

            //     self.$storage.departments = departmentsList;
            // }
            return self.$storage.departments || null;
        }

        var setDepartments = function (departments) {
            self.$storage.departments = departments;
        }

        var getLastCatalogRefresh = function () {
            return self.$storage.lastCatalogRefresh || null;
        }

        var setLastCatalogRefresh = function (newVal) {
            self.$storage.lastCatalogRefresh = newVal;
        }

        var getSuppliers = function () {
            return self.$storage.suppliers || null;
        }

        var setSuppliers = function (newVal) {
            self.$storage.suppliers = newVal;
        }

        var service = {
            cleanLocalstorage: cleanLocalstorage,
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
            setNetworksBranchesMap: setNetworksBranchesMap,
            getUser: getUser,
            setUserName: setUserName,
            setUserBranch: setUserBranch,
            getDepartments: getDepartments,
            setDepartments: setDepartments,
            getLastCatalogRefresh: getLastCatalogRefresh,
            setLastCatalogRefresh: setLastCatalogRefresh,
            getSuppliers: getSuppliers,
            setSuppliers: setSuppliers,
           
        };

        return service;
    }

})();