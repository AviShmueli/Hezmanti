(function () {
    'use strict';

    angular
        .module('app')
        .component('mdSelectMulti', {
            bindings: {
                selectLable: '=',
                selectModel: '=',
                selectValues: '='
            },
            controller: SelectMultiController,
            controllerAs: 'vm',
            templateUrl: 'components/widgets/mdSelectMulti-template.html'
        });

    function SelectMultiController($scope) {

        
        var vm = this;
        vm.all = false

        if(!vm.selectModel){
            vm.selectModel = [];
        }

        vm.allCheck = function () {
            if (!vm.all) {
                vm.all = true;
                vm.selectValues.forEach(function (element) {
                    vm.selectModel.push(element.id);
                }, this);
            } else {
                vm.all = false;
                vm.selectModel = [];
            }
        }

    }

}());