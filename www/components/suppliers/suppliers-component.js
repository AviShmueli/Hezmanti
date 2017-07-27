(function() {
    'use strict';

    angular
        .module('app')
        .component('suppliers', {
            templateUrl:'components/suppliers/suppliers-template.html',
            controller: SuppliersController,
            controllerAs: 'vm',
            bindings: {
                showPriority: '=',
                suppliersList: '='
            },
        });

    SuppliersController.$inject = ['dataContext', 'server', 'lodash'];

    function SuppliersController(dataContext, server, _) {
        var vm = this;
        vm.query = {
            order: 'name',
        }
        
        if (!vm.suppliersList) {
            vm.suppliers = dataContext.getSuppliers();
        }
        else{
            vm.suppliers = vm.suppliersList;
        }

        if (!vm.suppliers) {
            server.getSuppliers().then(function (result) {
                vm.suppliers = result.data;
                dataContext.setSuppliers(vm.suppliers);
            });
        }

        vm.editMode = true;
        vm.edit_icon = vm.editMode ? 'edit' : 'done';
        vm.editTable = function () {
            if (vm.editMode === true) {
                vm.editMode = false;
                vm.edit_icon = 'done';
            } else {
                vm.editMode = true;
                vm.edit_icon = 'edit';
            }
        }
    }
})();