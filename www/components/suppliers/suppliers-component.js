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
                suppliersList: '=?',
                editSupliersCallback: '=?'
            },
        });

    SuppliersController.$inject = ['dataContext', 'server', 'lodash', '$mdDialog', '$mdToast'];

    function SuppliersController(dataContext, server, _, $mdDialog, $mdToast) {
        var vm = this;
        vm.query = {
            order: 'name',
        }
        console.log('suppliers component');
        // get from local storage
        if (!vm.suppliersList) {
            vm.suppliersList = dataContext.getSuppliers();
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
                if (vm.editSupliersCallback) {
                    vm.editSupliersCallback(vm.suppliersList);
                }
            }
        }

        vm.removeSupplier = function (supplier) {
            _.remove(vm.suppliersList, function (n) {
                return n.supplierId === supplier.supplierId;
            });
            if (vm.editSupliersCallback) {
                vm.editSupliersCallback(vm.suppliersList);
            }
        }

        vm.addSupplier = function (ev) {
            if (vm.showPriority) {

                // if function call'd from department component
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
                        if (vm.editSupliersCallback) {
                            vm.editSupliersCallback(vm.suppliersList);
                        }
                    }, function () {
                        //$scope.status = 'You cancelled the dialog.';
                    });
            } else {
                showNewSupplierDialog().then(function (result) {
                    if (result) {
                        vm.suppliersList.push(result);
                        server.addSupplier(result).then(function (result) {
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent("הפעולה בוצעה בהצלחה!")
                                .hideDelay(3000)
                            );
                        });
                    }
                });
            }
        };

        function showNewSupplierDialog() {
            return $mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: './components/suppliers/newSuppliersDialog-template.html', 
                controller: function DialogController($scope, $mdDialog) {
                    $scope.cancel = function () {
                        $mdDialog.hide();
                    }
                    $scope.ok = function () {
                        if ($scope.newSupplier.$valid) {
                            $mdDialog.hide({
                                name: $scope.name,
                                supplierId: $scope.supplierId
                            });
                        }

                    }
                }
            });
        }

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

    angular
        .module('app')
        .controller('selectSuppliersController', selectSuppliersController);

})();