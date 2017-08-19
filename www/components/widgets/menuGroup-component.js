(function () {
    'use strict';

    angular
        .module('app')
        .component('menuGroup', {
            bindings: {
                viewMode: '=',
                headerText: '=',
                buttons: '=',
                defultOpen: '='
            },
            controller: menuGroupController,
            controllerAs: 'vm',
            templateUrl: 'components/widgets/menuGroup-template.html'
        });

    function menuGroupController($state, dataContext, $mdDialog) {

        var vm = this;
        vm.showSection = vm.defultOpen || false;

        vm.expand_icon = vm.showSection ? 'expand_less' : 'expand_more';
        vm.toggleSection = function () {
            if (vm.showSection === true) {
                vm.showSection = false;
                vm.expand_icon = 'expand_more';
            } else {
                vm.showSection = true;
                vm.expand_icon = 'expand_less';
            }
        }

        vm.switchViewMode = function (toMode) {
            if(toMode.mode === 'cleanLocalstorage'){
                promptConfirm();
                return;
            }
            vm.defultOpen = true;
            $state.params = {};
            //$state.go('admin' ,{mode: toMode.mode});
            window.location = '/#/admin/'+ toMode.mode;
        }

        var promptConfirm = function () {
            var confirm = $mdDialog.confirm()
                .title('האם את/ה בטוח שברצונך למחוק את כל הנתונים ?')
                .parent(angular.element(document.querySelector('#dialogsWraper')))
                .ariaLabel('Lucky day')
                .ok('מחק')
                .cancel('ביטול');

            $mdDialog.show(confirm).then(function () {
                dataContext.cleanLocalstorage();
                location.reload();
            }, function () { });
        }
    }
})();