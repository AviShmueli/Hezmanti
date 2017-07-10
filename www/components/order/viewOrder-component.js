(function () {
    'use strict';

    angular
        .module('app')
        .component('viewOrder', {
            bindings: {
                items: '=',
                orderTitle: '=',
                orderChanged: '=',
                updateOrder: '=',
                showDeleteBtn: '=',
                switchToNewOrderMode: '=',
                showEditBtn: '=',
                itemCountChangedCallback : '=',
                cleanData: '='
            },
            controller: viewOrderController,
            controllerAs: 'vm',
            templateUrl: 'components/order/viewOrder-template.html'
        });

    function viewOrderController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, $filter, $mdDialog) {

        var vm = this;
        vm.editMode = false;
        vm.buttonIcon = 'edit';

        vm.showEditBtn = vm.showEditBtn === undefined ? true : vm.showEditBtn;

        vm.navigateTo = function (to) {
            $location.path('/' + to);
        }

        vm.switchMode = function () {
            if (vm.editMode) {
                updateOrder();
                //vm.items =  dataContext.getCartItemsList();
                vm.editMode = false;
                vm.buttonIcon = 'edit';
            } else {
                vm.editMode = true;
                vm.buttonIcon = 'done';
            }
        }

        var updateOrder = function name(params) {
            //if in admin page go to server and update order 
            if (vm.updateOrder) {
                vm.updateOrder();
            }
        };

        vm.itemCountChanged = function (item) {
            // in view order dialog this is the callback function
            if (vm.orderChanged) {
                vm.orderChanged(item);
            } else {
                var isNew = vm.itemCountChangedCallback(item);
                if (isNew) {
                    vm.items.push(item);
                }
            }
        }

        vm.cleanCart = function (ev) {
            var confirm = $mdDialog.confirm()
                .title('האם את/ה בטוח שברצונך למחוק את כל הפריטים?')
                .parent(angular.element(document.querySelector('#dialogsWraper')))
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('מחק')
                .cancel('ביטול');

            $mdDialog.show(confirm).then(function () {
                vm.cleanData();
                vm.switchToNewOrderMode('new');
            }, function () { });
        }
    }

})();