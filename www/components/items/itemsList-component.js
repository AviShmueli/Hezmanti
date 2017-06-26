(function () {
    'use strict';

    angular
        .module('app')
        .component('itemsList', {
            bindings: {
                client: '=',
            },
            controller: itemsListController,
            controllerAs: 'vm',
            templateUrl: 'components/items/itemsList-template.html'
        });

    function itemsListController() {

        var vm = this;

        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';
        vm.toggleFilterSection = function () {
            //var svgMorpheus = new SVGMorpheus('#expand_more_icon svg');
            if (vm.showTasksFilter === true) {
                vm.showTasksFilter = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showTasksFilter = true;
                vm.expand_icon = 'expand_less';
            }
        }

        vm.items = [{
            name: 'בשר הודו אדום טרי מחפוד תפז',
            serialNumber: '2225041',
        }, {
            name: 'כרעיים',
            serialNumber: '0002',
        }, {
            name: 'צלעות כבש',
            serialNumber: '0003',
        }];

    }

}());