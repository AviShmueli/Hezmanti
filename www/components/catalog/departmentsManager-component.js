(function() {
    'use strict';

    // Usage:
    // 
    // Creates:
    // 

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

    DepartmentsManagerController.$inject = ['dataContext', 'device'];

    function DepartmentsManagerController(dataContext, device) {
        var vm = this;

        vm.imagesPath = device.getImagesPath();
        
        vm.departments = dataContext.getDepartments()

    }
})();