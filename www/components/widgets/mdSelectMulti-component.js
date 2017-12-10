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

    function SelectMultiController($scope, $element) {


        var vm = this;
        if (!vm.selectModel) {
            vm.selectModel = [];
        }

        vm.selectAll = function () {

            vm.selectValues.forEach(function (element) {
                if (!vm.selectModel) {
                    vm.selectModel = [];
                }
                vm.selectModel.push(element.id || element.name);
            }, this);

        }

        $element.find('input').on('keydown', function (ev) {
            ev.stopPropagation();
        });

        vm.clearAll = function () {
            vm.selectModel = [];
        }

    }

}());