(function() {
    'use strict';

    angular
        .module('app')
        .component('departmentsManager', {
            templateUrl:'components/catalog/departmentsManager-template.html',
            controller: DepartmentsManagerController,
            controllerAs: 'vm',
            bindings: {
                Binding: '=',
            },
        });

    DepartmentsManagerController.$inject = ['dataContext', 'device', '$state', 'server'];

    function DepartmentsManagerController(dataContext, device, $state, server) {
        var vm = this;

        vm.imagesPath = device.getImagesPath();
        
        vm.departments = dataContext.getDepartments();

        // if not excist in local sorage, get from server
        if (!vm.departments) {
            server.getDepartments().then(function (result) {
                vm.departments = result.data;
                dataContext.setDepartments(vm.departments);
            });
        }

        vm.goToDepartmentPage = function (department) {
            $state.go('admin' ,{mode: 'departmentsManager', id: department.id});
        }

    }
})();