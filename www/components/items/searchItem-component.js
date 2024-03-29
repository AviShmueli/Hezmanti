(function () {
    'use strict';

    angular
        .module('app')
        .component('searchItem', {
            bindings: {
                itemCountChanged: '='
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
        vm.minimumRequiered = false;
        
        var timer;
        vm.searchInputKeyUp = function () {
            vm.searchIcon = 'close';
            $timeout.cancel(timer);
            timer = $timeout(function () {
                if (vm.searchString.length > 2) {
                    vm.showProgress = true;
                    vm.minimumRequiered = false;
                    search(vm.searchString);
                }
                else{
                    vm.minimumRequiered = true;
                }
            }, 600);
            if (vm.searchString === '') {
                vm.cleanSearch();
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
            vm.minimumRequiered = false;
        }

        vm.countChanged = function(item){
            if (vm.itemCountChanged) {
                vm.itemCountChanged(item);                        
            }
        }
    }

}());