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

        if (!vm.selectModel) {
            vm.selectModel = [];
        }

        vm.selectAll = function () {

            vm.selectValues.forEach(function (element) {
                if (!vm.selectModel) {
                    vm.selectModel = [];
                }
                vm.selectModel.push(element.id);
            }, this);

        }

        vm.clearAll = function () {
            vm.selectModel = [];
        }

    }

}());