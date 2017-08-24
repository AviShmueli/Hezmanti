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

                    if (property === 'items') {

                        filter[property].forEach(function (element) {
                            angular.forEach(itemsToWorkOn, function (order) {
                                if (order.item.itemName && order.item.itemName === element) {
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
        .filter('unique', function (lodash) {
            return function (arr, field) {
                return lodash.uniq(arr, function (a) {
                    return a[field];
                });
            };

        })
        .filter('ordersByDepartment', function ($filter) {
            return function (braches, department) {
                var filtered = [];
                angular.forEach(braches, function (branch) {
                    if (department === 'all') {
                        if (branch.departments && branch.departments.length > 0) {
                            branch.sendOrder = true;
                            filtered.push(branch);
                            return;
                        } else {
                            branch.sendOrder = false;
                        }
                    } else {
                        if (branch.departments && branch.departments.length > 0) {

                            if (branch.departments.indexOf(department.id) !== -1) {
                                branch.sendOrder = true;
                                filtered.push(branch);
                                return;
                            } else {
                                branch.sendOrder = false;
                            }
                        }
                    }

                    filtered.push(branch);
                });
                return filtered;
            };
        });

})();