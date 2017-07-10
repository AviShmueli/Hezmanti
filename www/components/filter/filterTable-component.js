(function () {
    'use strict';

    angular
        .module('app')
        .component('filterTable', {
            bindings: {
                cardTitle: '=',
                onFilterCallback: '=',
                showDownloadExcelBtn: '=',
                initialValues: '='
            },
            controller: filterTableController,
            controllerAs: 'vm',
            templateUrl: 'components/filter/filterTable-template.html'
        });

    function filterTableController(server, $q, filesHandler, $filter, $timeout, dataContext) {

        var vm = this;

        vm.expand_icon = vm.showTasksFilter ? 'expand_less' : 'expand_more';
        vm.toggleFilterSection = function () {
            if (vm.showTasksFilter === true) {
                vm.showTasksFilter = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showTasksFilter = true;
                vm.expand_icon = 'expand_less';
            }
        }

        if (vm.initialValues) {
            for (var property in vm.initialValues) {
                vm[property] = vm.initialValues[property];
            }
        }

        vm.ordersFilter = {};
        var filter = {};

        vm.filter = function () {

            var includeNetwork = true;
            if (vm.ordersFilter.hasOwnProperty('branchId') && vm.ordersFilter.branchId.length > 0 && vm.ordersFilter.hasOwnProperty('networkId')) {
                includeNetwork = false;
            }

            for (var property in vm.ordersFilter) {
                if (vm.ordersFilter.hasOwnProperty(property)) {
                    if (vm.ordersFilter[property] === '' || vm.ordersFilter[property] === null || vm.ordersFilter[property].length < 1) {
                        delete vm.ordersFilter[property];
                    } else {
                        if (property !== 'networkId' || (property === 'networkId' && includeNetwork)) {
                            if (typeof (vm.ordersFilter[property]) !== "string" && typeof (vm.ordersFilter[property]) !== "number") {
                                for (var index = 0; index < vm.ordersFilter[property].length; index++) {
                                    var element = vm.ordersFilter[property][index];
                                    if (!filter.hasOwnProperty('$or')) {
                                        filter['$or'] = [];
                                    }
                                    var obj = {};
                                    if (property === 'departmentId') {
                                        obj['items.itemDepartmentId'] = parseInt(element);
                                    } else {
                                        obj[property] = element;
                                    }
                                    filter['$or'].push(obj);
                                }
                            } else {
                                filter[property] = vm.ordersFilter[property];
                            }
                        }
                    }
                }
            }

            // handel the free text input
            if (vm.ordersFilterFreeText !== undefined && vm.ordersFilterFreeText !== '') {
                filter['items.itemName'] = {
                    "$regex": vm.ordersFilterFreeText,
                    "$options": "i"
                };
            } else {
                delete vm.ordersFilter['items'];
            }

            // handel the date input
            if (vm.createdDate !== undefined && vm.createdDate !== null && vm.createdDate !== '') {
                filter['createdDate'] = vm.createdDate.toLocaleDateString()
            } else {
                delete vm.ordersFilter.createdDate;
            }

            vm.onFilterCallback(filter, vm.ordersFilter.departmentId);

            filter = {};
        };

        vm.getNetworksBranches = function () {
            if (!vm.ordersFilter.networkId) {
                return;
            }
            var listToReturn = [];
            if (vm.ordersFilter.networkId && typeof (vm.ordersFilter.networkId) === 'string') {
                return vm.networksBranchesMap[vm.ordersFilter.networkId];
            } else {
                for (var index = 0; index < vm.ordersFilter.networkId.length; index++) {
                    var element = vm.ordersFilter.networkId[index];
                    listToReturn = listToReturn.concat(vm.networksBranchesMap[element]);
                }
                return listToReturn;
            }
        }
        /* --- arnge data --- */

        vm.branches = dataContext.getBranches();
        vm.networks = dataContext.getNetworks();
        vm.departments = dataContext.getDepartments();
        vm.networksBranchesMap = dataContext.getNetworksBranchesMap();

        if (!vm.branches || !vm.networks || !vm.networksBranchesMap) {
            server.getAllBranches().then(function (response) {
                var branchesMap = {};
                var networksMap = {};
                var networksBranchesMap = {};
                for (var index = 0; index < response.data.length; index++) {
                    var b = response.data[index];
                    if (!branchesMap.hasOwnProperty(b.serialNumber)) {
                        branchesMap[b.serialNumber] = {
                            name: b.name,
                            id: b.serialNumber
                        };
                    }
                    if (!networksMap.hasOwnProperty(b.networkId)) {
                        networksMap[b.networkId] = {
                            name: b.networkName,
                            id: b.networkId
                        };
                    }
                    if (!networksBranchesMap.hasOwnProperty(b.networkId)) {
                        networksBranchesMap[b.networkId] = [];
                    }
                    networksBranchesMap[b.networkId].push({
                        name: b.name,
                        id: b.serialNumber
                    });
                }
                vm.branches = Object.values(branchesMap);
                vm.networks = Object.values(networksMap);
                vm.networksBranchesMap = networksBranchesMap;

                dataContext.setBranches(vm.branches);
                dataContext.setNetworks(vm.networks);
                dataContext.setNetworksBranchesMap(vm.networksBranchesMap);
            })
        }

        $timeout(function () {
            vm.filter();
        }, 0);

    }

}());