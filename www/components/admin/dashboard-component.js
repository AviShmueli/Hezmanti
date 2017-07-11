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

    function dashboardController(server, $q, $interval, $location, dataContext) {

        var vm = this;
        vm.allBranches = [];
        vm.showLaunchBtn = $location.search().s !== undefined ? false : true;

        vm.branchesMap = {};
        vm.allBranches = dataContext.getBranches();

        var setBranchesMap = function () {
            angular.forEach(vm.allBranches, function (obj, key) {
                vm.branchesMap[obj.id] = obj;
            });
        }


        if (!vm.allBranches) {
            server.getAllBranches().then(function (response) {
                vm.allBranches = response.data;
                vm.allBranchesLength = vm.allBranches.length - 1;
                setBranchesMap();
                dataContext.setBranches(vm.allBranches);
            });
        } else {
            vm.allBranchesLength = vm.allBranches.length;
            setBranchesMap();
        }
        

        vm.openInNewTab = function () {
            window.open(window.location.href + '?s=0', '_blank');
        }

        var resetAllBranches = function () {
            for (var index = 0; index < vm.allBranches.length; index++) {
                var element = vm.allBranches[index];
                element['sendOrder'] = false;    
            }
        }

        vm.lastUpdateDate;

        var getAllTodayOrders = function () {
            server.getAllTodayOrders().then(function (response) {
                for (var index = 0; index < response.data.length; index++) {
                    var order = response.data[index];
                    vm.branchesMap[order.branchId]['sendOrder'] = true;
                }
                
            });
            var date = new Date().getDate();
            if (date !== vm.lastUpdateDate) {
                resetAllBranches();
            }
            vm.lastUpdateDate = date;
        }

        resetAllBranches();
        getAllTodayOrders();

        $interval(getAllTodayOrders, 10000);
    }

}());