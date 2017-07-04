(function () {
    'use strict';

    angular
        .module('app')
        .controller('HistoryController', HistoryController);

    HistoryController.$inject = ['dataContext', '$timeout', 'server', '$q', '$mdDialog',
                                 '$location'];

    function HistoryController(dataContext, $timeout, server, $q, $mdDialog,
                               $location) {

        var vm = this;

        var user = dataContext.getUser();
        var filter = {'branchId': user.branch.serialNumber};
        vm.totalOrderCount = 0;
        vm.query = {
            order: '-createdDate',
            limit: 10,
            page: 1
        };

        vm.getOrders = function () {

            server.getAllOrdersCount(filter).then(function (response) {
                vm.totalOrderCount = response.data;
            });

            var deferred = $q.defer();
            vm.promise = deferred.promise;

            server.getAllOrders(vm.query, filter).then(function (response) {
                vm.orders = response.data;
                deferred.resolve();
            })
        };

        vm.openOrderDialog = function (order, ev) {
            $mdDialog.show({
                    controller: 'ViewOrderDialogController',
                    templateUrl: '/components/order/viewOrderDialog-template.html',
                    controllerAs: vm,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true,
                    locals: {
                        order: order,
                        showEditBtn: false
                    }
                })
                .then(function (answer) {
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    //$scope.status = 'You cancelled the dialog.';
                });
        }

        vm.navigateTo = function(to){
            $location.path('/' + to);
        }

        $timeout(function () {
            vm.getOrders();
        }, 0);

    }
})();