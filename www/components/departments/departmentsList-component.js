(function () {
    'use strict';

    angular
        .module('app')
        .component('departmentsList', {
            bindings: {
                client: '=',
            },
            controller: departmentsListController,
            controllerAs: 'vm',
            templateUrl: 'components/departments/departmentsList-template.html'
        });

    function departmentsListController(server, $q) {

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

        vm.departmentsList = [];

        var deferred = $q.defer();
        vm.promise = deferred.promise;

        server.getCatalog().then(function(response){
            vm.items = response.data;
            vm.departmentsMap = {};
            for (var index = 0; index < response.data.length; index++) {
                var item = response.data[index];
                if(!vm.departmentsMap.hasOwnProperty(item.departmentId)){
                    vm.departmentsMap[item.departmentId] = [];
                    vm.departmentsList.push({name: item.departmentName, id: item.departmentId});
                }
                vm.departmentsMap[item.departmentId].push(item);
            }
            deferred.resolve();
        })       

    }

}());