(function(){
    'use strict';

    angular
        .module('app')
        .component('clientView', {
            bindings: {
                client: '=',
            },
            controller: clientViewController,
            controllerAs: 'vm',
            templateUrl: 'components/admin/clientView-template.html'
        });

    function clientViewController() {
        
        var vm = this;

    }

}());