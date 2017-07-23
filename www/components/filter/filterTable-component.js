(function () {
    'use strict';

    angular
        .module('app')
        .component('filterTable', {
            bindings: {
                cardTitle: '=',
                onFilterCallback: '=',
                showDownloadExcelBtn: '=',
                initialValues: '=',
                downloadFilterdTable: '='
            },
            controller: filterTableController,
            controllerAs: 'vm',
            templateUrl: 'components/filter/filterTable-template.html'
        });

    function filterTableController($scope, server, $q, filesHandler, $filter, $timeout, dataContext, $mdConstant) {

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
                                if (vm.ordersFilter[property].length === 1) {
                                    if (property === 'departmentId') {
                                        filter['items.itemDepartmentId'] = parseInt(vm.ordersFilter[property][0]);
                                    } else {
                                        if (property === 'branchId') {
                                            filter['branchId'] = parseInt(vm.ordersFilter[property][0]);
                                        } else {
                                            filter[property] = vm.ordersFilter[property][0];
                                        }

                                    }
                                } else {
                                    for (var index = 0; index < vm.ordersFilter[property].length; index++) {
                                        var element = vm.ordersFilter[property][index];
                                        if (!filter.hasOwnProperty('$or')) {
                                            filter['$or'] = [];
                                        }
                                        var obj = {};
                                        if (property === 'departmentId') {
                                            obj['items.itemDepartmentId'] = parseInt(element);
                                        } else {
                                            if (property === 'branchId') {
                                                obj['branchId'] = parseInt(element);
                                            } else {
                                                obj[property] = element;
                                            }
                                        }
                                        filter['$or'].push(obj);
                                    }
                                }
                            } else {
                                filter[property] = vm.ordersFilter[property];
                            }
                        }
                    }
                }
            }

            // handel the free text input
            if (vm.ordersFilter.freeText !== undefined && vm.ordersFilter.freeText !== '') {
                filter['items.itemName'] = {
                    "$regex": vm.ordersFilter.freeText,
                    "$options": "i"
                };
            } else {
                delete vm.ordersFilter['items'];
            }

            // handel the date input
            if (vm.ordersFilter.createdDate !== undefined && vm.ordersFilter.createdDate !== null && vm.ordersFilter.createdDate !== '') {
                //var date = vm.createdDate.toLocaleDateString().split('/');

                filter['createdDate'] = vm.ordersFilter.createdDate;
            } else {
                delete vm.ordersFilter.createdDate;
            }

            // handel the switch input that indicate whther to filter items that havent been handled yet
            if (vm.unhandledItems) {
                //TODO: complete this when client side filtering will work
                filter["unhandledItems"] = true;
            }

            // handel the switch input that indicate whther to filter items that havent been handled yet
            if (vm.showSecondOrders) {
                filter["type"] = "secondOrder";
            }

            vm.onFilterCallback(filter, vm.ordersFilter);

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

        /* --- Items --- */

        vm.readonly = false;
        vm.selectedItems = [];
        vm.selectedItem = {};
        vm.searchText = null;
        vm.querySearch = querySearch;
        vm.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
        vm.transformChip = transformChip;

        function querySearch(query) {
            var results = query ? vm.items.filter(createFilterFor(query)) : [];
            return results;
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(item) {
                return (item.name.indexOf(lowercaseQuery) === 0);
            };
        }

        function transformChip(chip) {
            // If it is an object, it's already a known chip
            if (angular.isObject(chip)) {
                return chip;
            }

            // Otherwise, create a new one
            return {
                name: chip.name,
                type: 'new'
            }
        }


        $scope.$watch(
            "vm.networkFilterAll",
            function handleFooChange(newValue, oldValue) {
                if (newValue) {
                    vm.networks.forEach(function (element) {
                        vm.ordersFilter.networkId.push(element);
                    }, this);
                } else {
                    vm.ordersFilter.networkId = [];
                }
            }
        );
        /* --- arnge data --- */

        var setItemsList = function (catalog) {
            var itemsList = [];

            for (var d in catalog) {
                if (catalog.hasOwnProperty(d)) {
                    var items = catalog[d];
                    itemsList = itemsList.concat(items);
                }
            }

            return itemsList;
        }

        vm.branches = dataContext.getBranches();
        vm.networks = dataContext.getNetworks();
        vm.departments = dataContext.getDepartments();
        vm.networksBranchesMap = dataContext.getNetworksBranchesMap();
        //vm.items = setItemsList(dataContext.getCatalog());

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
                            id: b.serialNumber,
                            networkId: b.networkId,
                            networkName: b.networkName
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