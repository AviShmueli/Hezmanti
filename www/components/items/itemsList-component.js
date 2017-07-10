(function () {
    'use strict';

    angular
        .module('app')
        .component('itemsList', {
            bindings: {
                items: '=',
                listTitle: '=',
                defultOpen: '=',
                canShrink: '=',
                departmentId: '=',
                editMode: '=',
                itemCountChanged: '='
            },
            controller: itemsListController,
            controllerAs: 'vm',
            templateUrl: 'components/items/itemsList-template.html'
        });

    function itemsListController(server, $q, dataContext, device, $timeout) {

        var vm = this;

        vm.showAvatar = vm.departmentId !== undefined ? true : false;
        vm.showArrow = vm.canShrink !== undefined ? vm.canShrink : true;
        vm.showList = vm.defultOpen || false;
        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';

        vm.imagesPath = device.getImagesPath();

        vm.toggleFilterSection = function () {
            if (vm.showArrow) {
                if (vm.showList === true) {
                    vm.showList = false;
                    vm.expand_icon = 'expand_more';
                } else {
                    vm.showList = true;
                    vm.expand_icon = 'expand_less';
                }
            }
        }

        var timer;
        vm.itemCountInputBlur = function (item) {
            $timeout.cancel(timer);
            timer = $timeout(function () {
                if (vm.itemCountChanged) {
                    vm.itemCountChanged(item);
                }
            }, 500);
        }
    }

}());