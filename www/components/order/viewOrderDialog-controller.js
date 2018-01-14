(function () {
    'use strict';

    angular
        .module('app')
        .controller('ViewOrderDialogController', ViewOrderDialogController);

    function ViewOrderDialogController($scope, $mdDialog, $mdToast, server, order, showEditBtn, mode) {
        console.log('ViewOrderDialogController');
        $scope.hide = function () {
            $mdDialog.hide();
        }

        $scope.order = order;
        $scope.showEditBtn = showEditBtn;
        $scope.titleText = (mode !== undefined && mode === 'order')? 'הזמנה' : 'דיווח מלאי' ;

        $scope.orderChanged = function (newOrder) {
            console.log('ViewOrderDialogController 1');
            for (var index = 0; index < this.items.length; index++) {
                var item = this.items[index];
                if (item.serialNumber === newOrder.serialNumber) {
                    item.count = newOrder.count;
                    return;
                }
            }
            this.items.push(newOrder);
        }

        $scope.updateOrder = function () {
            console.log('ViewOrderDialogController 2');
            server.updateOrder($scope.order).then(function (result) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('ההזמנה עודכנה בהצלחה!')
                    .hideDelay(3000)
                );
            });
        }
    }

})();