(function () {
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
            return function (orderItems, filter) {
                var filtered = [];
                var itemsToWorkOn = orderItems;
                for (var property in filter) {
                    if (property === 'networkId') {
                        filter[property].forEach(function (element) {
                            angular.forEach(itemsToWorkOn, function (order) {
                                if (order.order.networkId === element) {
                                    filtered.push(order);
                                }
                            });
                        }, this);
                        itemsToWorkOn = filtered;
                        filtered = [];
                    }

                    if (property === 'branchId') {
                        filter[property].forEach(function (element) {
                            angular.forEach(itemsToWorkOn, function (order) {
                                if (order.order.branchId === parseInt(element)) {
                                    filtered.push(order);
                                }
                            });
                        }, this);
                        itemsToWorkOn = filtered;
                        filtered = [];
                    }

                    if (property === 'departmentId') {
                        filter[property].forEach(function (element) {
                            angular.forEach(itemsToWorkOn, function (order) {
                                if (order.item.itemDepartmentId === parseInt(element)) {
                                    filtered.push(order);
                                }
                            });                           
                        }, this);
                        itemsToWorkOn = filtered;
                        filtered = [];
                    }

                    if (property === 'orderId') {
                        // remove this when handeling multi order Ids filtering
                        filter.orderId = [filter.orderId];

                        filter[property].forEach(function (element) {
                            angular.forEach(itemsToWorkOn, function (order) {
                                if (order.order.orderId === parseInt(element)) {
                                    filtered.push(order);
                                }
                            });                           
                        }, this);
                        itemsToWorkOn = filtered;
                        filtered = [];
                    }

                    if (property === 'freeText') {
                        // remove this when handeling multi order Ids filtering
                        filter.freeText = [filter.freeText];

                        filter[property].forEach(function (element) {
                            angular.forEach(itemsToWorkOn, function (order) {
                                if (order.item.itemName && order.item.itemName.indexOf(element) !== -1) {
                                    filtered.push(order);
                                }
                            });                           
                        }, this);
                        itemsToWorkOn = filtered;
                        filtered = [];
                    }

                    // if (filter.departmentId) {
                    //     order.items = $filter('departmentsItems')(order.items, filter.departmentId);
                    // }
                }

                return itemsToWorkOn;
            };
        })
        .filter('dateFilter', function ($filter) {
            return function (orderItems, startDate, endDate) {
                var filtered = [];
                angular.forEach(orderItems, function (order) {

                    var orderDate = new Date(order.order.createdDate);

                    if (orderDate >= startDate && orderDate < endDate) {
                        filtered.push(order);
                    }
                });
                return filtered;
            };
        })

})();