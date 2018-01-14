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
        console.log('departmentsManager component');
        vm.imagesPath = device.getImagesPath();
        
        vm.departments = dataContext.getDepartments();

        vm.goToDepartmentPage = function (department) {
            $state.go('admin' ,{mode: 'departmentsManager', id: department.id});
        }

    }
})();