(function() {
    'use strict';

    angular
        .module('app')
        .component('departmentView', {
            templateUrl:'components/catalog/departmentView-template.html',
            controller: DepartmentViewController,
            controllerAs: 'vm',
            bindings: {
                departmentId: '=',
            },
        });

    DepartmentViewController.$inject = ['dataContext', 'device', 'lodash'];

    function DepartmentViewController(dataContext, device, _) {
        var vm = this;

        vm.imagesPath = device.getImagesPath();
        
        vm.departments = dataContext.getDepartments();

        vm.department = _.find(vm.departments, 'id', vm.departmentId);

    }
})();