(function () {
    'use strict';

    angular
        .module('app')
        .controller('EntryScreenController', EntryScreenController);

    EntryScreenController.$inject = [
        '$rootScope', '$scope', 'server', '$state', '$interval',
        '$log', 'device', 'dataContext', '$location', '$mdDialog'
    ];

    function EntryScreenController($rootScope, $scope, server, $state, $interval,
        $log, device, dataContext, $location, $mdDialog) {

        var vm = this;

        vm.imagesPath = device.getImagesPath();
        vm.user = dataContext.getUser();
        vm.userAutorized = false;

        vm.navigateTo = function (to) {
            $location.path('/' + to);
        }

        document.addEventListener("deviceready", function () {
            device.setAppDir(cordova.file.applicationDirectory);
        }, false);

        var openUserNameAlert = function () {

            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .parent(angular.element(document.querySelector('#dialogsWraper')))
                .title('הזדהות באפליקציה')
                .textContent('אנא הזן את שמך המלא')
                .placeholder('שם ושם משפחה')
                .ariaLabel('fullName')
                .ok('אישור');

            $mdDialog.show(confirm).then(function (result) {
                dataContext.setUserName(result);
                vm.user.name = result;
                vm.openBranchCodeAler();
            }, function () {});

        }

        vm.openBranchCodeAlert = function () {
            vm.user.branch = undefined;
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .parent(angular.element(document.querySelector('#dialogsWraper')))
                .title('קישור לסניף')
                .textContent('בכדי לקשר אותך לסניף, פנה למנהל במשרד על מנת לקבל את קוד הגישה לסינף שלך.')
                .placeholder('קוד גישה')
                .ariaLabel('code')
                .ok('אישור');

            $mdDialog.show(confirm).then(function (code) {
                server.checkBranchCode(code).then(function (result) {
                    if (result.data !== 'not-found') {
                        dataContext.setUserBranch(result.data);
                        vm.user.branch = result.data;
                        vm.userAutorized = true;
                    } else {
                        showBranchNotFoundAlert();
                    }
                }, function (error) {

                });
            }, function () {});

        }

        var showBranchNotFoundAlert = function () {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#dialogsWraper')))
                .clickOutsideToClose(true)
                .title('שגיאה בזיהוי')
                .textContent('הקוד שהכנסת שגוי, אנא נסה שנית.')
                .ariaLabel('Alert Dialog Demo')
                .ok('אישור')
            );
        }


        if (vm.user !== undefined){
            if (vm.user.name === undefined) {
                 openUserNameAlert();
            }
            if (vm.user.branch === undefined) {
                vm.openBranchCodeAlert();
            }
            if (vm.user.name !== undefined && vm.user.branch && undefined) {
                vm.userAutorized = true;
            }
        }            
        else {
            openUserNameAlert();
        }


    }

})();