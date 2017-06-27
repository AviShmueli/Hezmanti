(function () {
    'use strict';

    angular
        .module('app')
        .component('searchItem', {
            bindings: {

            },
            controller: searchItemController,
            controllerAs: 'vm',
            templateUrl: 'components/items/searchItem-template.html'
        });

    function searchItemController(server, $q, $timeout) {

        var vm = this;

        vm.searchIcon = 'search';
        vm.showProgress = false;
        vm.searchString = '';
        vm.searchResults = null;
        
        var timer;
        vm.searchInputKeyUp = function () {
            vm.searchIcon = 'close';
            $timeout.cancel(timer);
            timer = $timeout(function () {
                if (vm.searchString.length > 4) {
                    vm.showProgress = true;
                    search(vm.searchString);
                }
            }, 600);
            if (vm.searchString === '') {
                vm.searchResults = null;
                vm.searchIcon = 'search';
            }
        }

        var search = function (searchString) {
            server.searchItems(searchString).then(function (result) {
                vm.searchResults = result.data;
                vm.showProgress = false;
            }, function (error) {

            });
        }

        vm.cleanSearch = function () {
            vm.searchString = '';
            vm.searchResults = null;
            vm.searchIcon = 'search';
        }
    }

}());