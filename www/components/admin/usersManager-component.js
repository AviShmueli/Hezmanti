(function () {
    'use strict';

    angular
        .module('app')
        .component('usersManager', {
            bindings: {
                client: '=',
            },
            controller: usersManagerController,
            controllerAs: 'vm',
            templateUrl: 'components/admin/usersManager-template.html'
        });

    function usersManagerController(server, $q, dataContext) {

        var vm = this;
        console.log('usersManager component');
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

        var deferred = $q.defer();
        vm.promise = deferred.promise;

        vm.networks = dataContext.getNetworks();

        server.getAllBranches().then(function(response){
            vm.branches = response.data;
            deferred.resolve();
        })

    }

}());