(function () {
    'use strict';

    angular
        .module('app')
        .component('dashboard', {
            bindings: {
                client: '=',
            },
            controller: dashboardController,
            controllerAs: 'vm',
            templateUrl: 'components/admin/dashboard-template.html'
        });

    function dashboardController(server, $q, $interval) {

        var vm = this;
        vm.allBranches = [];

        server.getAllBranches().then(function(response){
            vm.allBranches = response.data;
            vm.allBranchesLength = vm.allBranches.length - 1;
        });

        $interval(function(){
            var index = Math.floor((Math.random() * vm.allBranchesLength) + 0);
            vm.allBranches[index]['sendOrder'] = true;
        },1000);

        vm.openInNewTabb = function () {
            window.open(window.location.href + '?s=0' ,'_blank');
        }

    }

}());