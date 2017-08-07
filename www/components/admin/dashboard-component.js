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

    function dashboardController(server, $q, $interval, $location, dataContext, device) {
        
        var vm = this;
        vm.allBranches = [];
        vm.showLaunchBtn = $location.search().s !== undefined ? false : true;

        vm.branchesMap = {};
        vm.allBranches = dataContext.getNetworksBranchesMap();
        vm.networks = dataContext.getNetworks();
        vm.departments = dataContext.getDepartments();

        vm.imagesPath = device.getImagesPath();

        var setBranchesMap = function () {
            angular.forEach(vm.allBranches, function (obj, key) {
                angular.forEach(obj, function (obj1, key1) {
                    vm.branchesMap[obj1.id] = obj1;
                });
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
            angular.forEach(vm.branchesMap, function (obj, key) {
                obj['sendOrder'] = false;
                obj['departments'] = [];
            });
        }

        vm.lastUpdateDate;

        var getAllTodayOrders = function () {
            server.getAllTodayOrders().then(function (response) {
                for (var index = 0; index < response.data.length; index++) {
                    var order = response.data[index];
                    vm.branchesMap[order.branchId]['sendOrder'] = true;
                    vm.branchesMap[order.branchId]['departments'] = [];
                    order.items.forEach(function(item) {
                        vm.branchesMap[order.branchId]['departments'].push(item.itemDepartmentId);
                    }, this);
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

        /* ----- Tabs ---- */
        vm.selectedDepartment = 0;
        vm.switchTab = function (department, selectedTab) {
            vm.selectedDepartment = department;
            console.log(department);
        }
    }

}());