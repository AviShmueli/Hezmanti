(function () {
    'use strict';

    angular
        .module('app')
        .component('suppliers', {
            templateUrl: 'components/suppliers/suppliers-template.html',
            controller: SuppliersController,
            controllerAs: 'vm',
            bindings: {
                showPriority: '=',
                suppliersList: '='
            },
        });

    SuppliersController.$inject = ['dataContext', 'server', 'lodash', '$mdDialog'];

    function SuppliersController(dataContext, server, _, $mdDialog) {
        var vm = this;
        vm.query = {
            order: 'name',
        }

        if (!vm.suppliersList) {
            vm.suppliersList = dataContext.getSuppliers();
        }

        if (!vm.suppliersList) {
            server.getSuppliers().then(function (result) {
                vm.suppliersList = result.data;
                dataContext.setSuppliers(vm.suppliersList);
            });
        }

        vm.editMode = true;
        vm.edit_icon = vm.editMode ? 'menu' : 'done';
        vm.editTable = function (from) {
            if (vm.editMode === true) {
                if (from === 'action') {
                    vm.editMode = false;
                    vm.edit_icon = 'done';
                }
            } else {
                vm.editMode = true;
                vm.edit_icon = 'menu';
            }
        }

        vm.addSupplier = function (ev) {
            $mdDialog.show({
                    controller: selectSuppliersController,
                    controllerAs: 'ctrl',
                    templateUrl: './components/suppliers/selectSuppliersDialog-template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function (answer) {
                    vm.suppliersList = vm.suppliersList.concat(answer);
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        };
    }

    function selectSuppliersController($scope, $mdDialog, dataContext) {

        var self = this;
        self.readonly = false;
        self.selectedItem = null;
        self.searchText = null;
        self.querySearch = querySearch;
        self.vegetables = loadVegetables();
        self.selectedVegetables = [];
        self.numberChips = [];
        self.numberChips2 = [];
        self.numberBuffer = '';
        self.autocompleteDemoRequireMatch = true;
        self.transformChip = transformChip;
        /**
         * Return the proper object when the append is called.
         */
        function transformChip(chip) {
            // If it is an object, it's already a known chip
            if (angular.isObject(chip)) {
                return chip;
            }
            // Otherwise, create a new one
            return {
                name: chip,
                type: 'new'
            }
        }
        /**
         * Search for vegetables.
         */
        function querySearch(query) {
            var results = query ? self.vegetables.filter(createFilterFor(query)) : [];
            return results;
        }
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(vegetable) {
                return (vegetable._lowername.indexOf(lowercaseQuery) === 0) ||
                    (vegetable.supplierId === lowercaseQuery);
            };
        }

        function loadVegetables() {
            var veggies = dataContext.getSuppliers();
            return veggies.map(function (veg) {
                veg._lowername = veg.name.toLowerCase();
                veg.supplierId = veg.supplierId;
                return veg;
            });
        }


        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
            if (answer === 'ok') {
                $mdDialog.hide(angular.copy(self.selectedVegetables));
            } else {
                $mdDialog.cancel();
            }
        };
    }



})();