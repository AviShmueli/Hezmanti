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
    .filter('distributionDataFilter', function ($filter) {
        return function (orderItems, filter, departments) {
            var filtered = [];
            angular.forEach(orderItems, function (order) {
                
                if (departments) {
                   order.items = $filter('departmentsItems')(order.items, departments);
                }
                
                for (var property in filter) {
                    var a = property;
                    //var b =  $filter('filter')(order.order, filter);
                }
                /*angular.forEach(departmentsIds, function (departmentId) {
                    if (item.itemDepartmentId === parseInt(departmentId)) {
                        filtered.push(item);
                    }
                });*/

                filtered.push(order);
            });
            return filtered;
        };
    })

})();