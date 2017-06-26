(function () {
    'use strict';

    angular
        .module('app')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider'];

    function config($stateProvider, $urlRouterProvider, $mdThemingProvider) {

        $mdThemingProvider.theme('default')
            .primaryPalette('brown')
            .accentPalette('orange');

        $urlRouterProvider.otherwise("/");

        $stateProvider.state("/", {
            url: "/",
            templateUrl: "components/entry/entryScreen.html",
            controller: "entryScreenController",
            controllerAs: "vm"
        });

        $stateProvider.state("newOrder", {
            url: "/newOrder",
            templateUrl: "components/order/newOrder.html",
            controller: "newOrderController",
            controllerAs: "vm"
        });

        $stateProvider.state("stocktaking", {
            url: "/stocktaking",
            templateUrl: "components/stocktaking/stocktaking.html",
            controller: "stocktakingController",
            controllerAs: "vm"
        });

        $stateProvider.state("admin", {
            url: "/admin",
            templateUrl: "components/admin/admin.html",
            controller: "AdminController",
            controllerAs: "vm"
        });
    }

})();