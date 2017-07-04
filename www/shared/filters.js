(function() {
    'use strict';

    angular.module('app')
    .filter('departmentsItems', function () {
        return function (items, departmentsIds) {
            var filtered = [];
            angular.forEach(items, function (item) {
                angular.forEach(departmentsIds, function (departmentId) {
                    if (item.itemDepartmentId === parseInt(departmentId)) {
                        filtered.push(item);
                    }
                });
            });
            return filtered;
        };
    })

})();