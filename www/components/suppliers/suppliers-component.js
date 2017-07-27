(function() {
    'use strict';

    angular
        .module('app')
        .component('suppliers', {
            templateUrl:'components/suppliers/suppliers-template.html',
            controller: SuppliersController,
            controllerAs: 'vm',
            bindings: {
                departmentId: '=',
            },
        });

    SuppliersController.$inject = ['dataContext', 'server', 'lodash'];

    function SuppliersController(dataContext, server, _) {
        var vm = this;
        vm.suppliers = dataContext.getSuppliers();
        vm.query = {
            order: 'name',
        }
        if (!vm.suppliers) {
            server.getSuppliers().then(function (result) {
                vm.suppliers = result.data;
                dataContext.setSuppliers(vm.suppliers);
            });
        }

        vm.edit_icon = vm.showTasksFilter ? 'edit' : 'done';
        vm.toggleFilterSection = function () {
            if (vm.showTasksFilter === true) {
                vm.showTasksFilter = false;
                vm.edit_icon = 'edit';
            } else {
                vm.showTasksFilter = true;
                vm.edit_icon = 'done';
            }
        }
    }
})();