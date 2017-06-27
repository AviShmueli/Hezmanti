(function () {
    'use strict';

    angular
        .module('app')
        .component('itemsList', {
            bindings: {
                items: '=',
                departmentName: '=',
                defultOpen: '='
            },
            controller: itemsListController,
            controllerAs: 'vm',
            templateUrl: 'components/items/itemsList-template.html'
        });

    function itemsListController(server, $q) {

        var vm = this;

        vm.showList = vm.defultOpen || false;
        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';
        vm.toggleFilterSection = function () {
            //var svgMorpheus = new SVGMorpheus('#expand_more_icon svg');
            if (vm.showList === true) {
                vm.showList = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showList = true;
                vm.expand_icon = 'expand_less';
            }
        }
    }

}());