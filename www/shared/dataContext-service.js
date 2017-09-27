(function () {
    'use strict';

    angular
        .module('app')
        .service('dataContext', dataContext);

    dataContext.$inject = ['$rootScope', '$localStorage'];

    function dataContext($rootScope, $localStorage) {

        var self = this;
        console.log('datacontext-services');
        self.$storage = $localStorage;
      //  console.log('sto=',$localStorage);

        if (self.$storage.cart === undefined) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 1 ');
            self.$storage.cart = {};
        }

        if (self.$storage.catalog === undefined) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 2 ');
            self.$storage.catalog = null;
        }

        if (self.$storage.branches === undefined) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 3 ');
            self.$storage.branches = null;
        }

        

        if (self.$storage.networks === undefined) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 4 ');
            self.$storage.networks = null;
        }

        if (self.$storage.networksBranchesMap === undefined) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 5 ');
            self.$storage.networksBranchesMap = null;
        }

        if (self.$storage.user === undefined) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 6 ');
            self.$storage.user = {};
        }

        if (self.$storage.departments === undefined) {
            self.$storage.departments = null;
        }

        var cleanLocalstorage = function () {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 7 ');
            $localStorage.$reset();
        }

        var getCart = function () {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 0 8 ');
            return self.$storage.cart || {};
        }

        var updateCart = function (item) {
            
            var card = getCart();
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 1',item,card);
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
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 2',item,card);
            if (card.hasOwnProperty(item._id)) {
                delete card[item._id];
            }
        }

        var getCartCount = function () {
            console.log('datacontext-services 3',Object.keys(self.$storage.cart).length);
            return Object.keys(self.$storage.cart).length;
        }

        var getCartItemsList = function () {
            console.log('datacontext-services 4',Object.values(self.$storage.cart));
            // TODO: replace Object.values !!!!
            return Object.values(self.$storage.cart);
        }

        var cleanCart = function () {
            console.log('datacontext-services 5');
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
            //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 6',catalog);
            self.$storage.catalog = ctalog;
            setLastCatalogRefresh(new Date().toISOString());
        }

        var getCatalog = function () {
            console.log('datacontext-services 7');
            return self.$storage.catalog;
        }

        var getBranches = function () {
            console.log('datacontext-services 8',self.$storage.branches);
            return self.$storage.branches;
        }

        var setBranches = function (branches) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>.datacontext-services 9',branches);
            self.$storage.branches = branches;
        }

        var getNetworks = function () {
            console.log('datacontext-services 10',self.$storage.networks);
            return self.$storage.networks;
        }

        var setNetworks = function (networks) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>..datacontext-services 11',networks);
            self.$storage.networks = networks;
        }
        
        var getNetworksBranchesMap = function () {
            console.log('datacontext-services 12',self.$storage.networksBranchesMap);
            return self.$storage.networksBranchesMap;
        }

        var setNetworksBranchesMap = function (networksBranchesMap) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 13',networksBranchesMap);
            self.$storage.networksBranchesMap = networksBranchesMap;
        }

        var getUser = function () {
            console.log('datacontext-services 14',self.$storage.user);
            return self.$storage.user;
        }

        var setUserName = function (userName) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 15',userName);
            self.$storage.user.name = userName;
        }

        var setUserBranch = function (branch) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 16',branch);
            self.$storage.user.branch = branch;
        }

        var getDepartments = function () {
            console.log('datacontext-services 17',self.$storage.departments);
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
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 18',departments);
            self.$storage.departments = departments;
        }

        var getLastCatalogRefresh = function () {
            console.log('datacontext-services 19',self.$storage.lastCatalogRefresh);
            return self.$storage.lastCatalogRefresh || null;
        }

        var setLastCatalogRefresh = function (newVal) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 20'.newVal);
            self.$storage.lastCatalogRefresh = newVal;
        }

        var getSuppliers = function () {
            console.log('datacontext-services 21',self.$storage.suppliers );
            return self.$storage.suppliers || null;
        }

        var setSuppliers = function (newVal) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>datacontext-services 22',newVal);
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