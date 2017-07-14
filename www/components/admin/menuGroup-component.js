(function () {
    'use strict';

    angular
        .module('app')
        .component('menuGroup', {
            bindings: {
                viewMode: '=',
                headerText: '=',
                buttons: '=',
                defultOpen: '='
            },
            controller: menuGroupController,
            controllerAs: 'vm',
            templateUrl: 'components/admin/menuGroup-template.html'
        });

    function menuGroupController($state) {

        var vm = this;
        vm.showSection = vm.defultOpen || false;

        vm.expand_icon = vm.showSection ? 'expand_less' : 'expand_more';
        vm.toggleSection = function () {
            if (vm.showSection === true) {
                vm.showSection = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showSection = true;
                vm.expand_icon = 'expand_less';
            }
        }

        vm.switchViewMode = function (toMode) {
            $state.go('admin' ,{mode: toMode});
        }
    }
})();