(function () {
    'use strict';

    angular
        .module('app')
        .controller('ViewOrderDialogController', ViewOrderDialogController);

    function ViewOrderDialogController($scope, $mdDialog, $mdToast, server, order, showEditBtn, mode) {

        $scope.hide = function () {
            $mdDialog.hide();
        }

        $scope.order = order;
        $scope.showEditBtn = showEditBtn;
        $scope.titleText = (mode !== undefined && mode === 'order')? 'הזמנה' : 'דיווח מלאי' ;

        $scope.orderChanged = function (newOrder) {
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