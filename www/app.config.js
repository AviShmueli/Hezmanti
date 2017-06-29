(function () {
    'use strict';

    angular
        .module('app')
        .config(config)
        .constant('SERVER_URL', 'https://hezmanti-prod.herokuapp.com');

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider'];

    function config($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider) {

        $httpProvider.interceptors.push('appInterceptor');

        $mdThemingProvider.theme('default')
            .primaryPalette('brown')
            .accentPalette('orange');

        $urlRouterProvider.otherwise("/");

        $stateProvider.state("/", {
            url: "/",
            templateUrl: "components/entry/entryScreen.html",
            controller: "EntryScreenController",
            controllerAs: "vm"
        });

        $stateProvider.state("order", {
            url: "/order",
            templateUrl: "components/order/order.html",
            controller: "OrderController",
            controllerAs: "vm"
        });

        $stateProvider.state("stocktaking", {
            url: "/stocktaking",
            templateUrl: "components/stocktaking/stocktaking.html",
            controller: "StocktakingController",
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