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

    function itemsListController(server, $q, dataContext) {

        var vm = this;

        vm.showList = vm.defultOpen || false;
        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';
        vm.toggleFilterSection = function () {
            if (vm.showList === true) {
                vm.showList = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showList = true;
                vm.expand_icon = 'expand_less';
            }
        }

        vm.itemCountInputBlur = function(item){
            if (item.count !== undefined && item.count !== '' && item.count > 0) {
                dataContext.updateCard(item);
            }
            else{
                dataContext.removeItemFromCard(item);
            }
        }
    }

}());