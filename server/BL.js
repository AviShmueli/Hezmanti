/*jshint esversion: 6 */

(function (BL) {

    BL.getAllBranches = getAllBranches;
    BL.getCatalog = getCatalog;
    BL.searchItems = searchItems;
    BL.addOrder = addOrder;
    BL.getAllOrders = getAllOrders;
    BL.getOrder = getOrder;
    BL.updateOrder = updateOrder;
    BL.getAllOrdersCount = getAllOrdersCount;
    BL.checkBranchCode = checkBranchCode;
    BL.updateUserLastSeenTime = updateUserLastSeenTime;
    BL.getAllTodayOrders = getAllTodayOrders;
    BL.saveDistribution = saveDistribution;
    BL.getSuppliers = getSuppliers;
    BL.addSupplier = addSupplier;
    BL.updateSupplier = updateSupplier;
    BL.editDepartment = editDepartment;
    BL.getDepartments = getDepartments;
    BL.markItemsAsDistrebuted = markItemsAsDistrebuted;
    BL.getDistributedItems = getDistributedItems;

    var Moment = require('moment-timezone');
    var deferred = require('deferred');
    var DAL = require('./DAL');

    function getAllBranches() {

        var d = deferred();

        DAL.getAllBranches().then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getCatalog() {

        var d = deferred();

        DAL.getCatalog().then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function searchItems(searchString) {

        var d = deferred();

        DAL.searchItems(searchString).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function addOrder(order) {

        var d = deferred();

        order.createdDate = new Date(order.createdDate);
        var seq = (order.type === 'order' || order.type === 'secondOrder') ? 'orderId' : 'stockId';
        DAL.getNextSequence(seq).then(function (result) {
            order['orderId'] = result;
            DAL.addOrder(order).then(function (result) {
                d.resolve(result);
            }, function (error) {
                d.deferred(error);
            });
        });

        return d.promise;
    }

    function updateOrder(order) {

        var d = deferred();

        DAL.updateOrder(order).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getAllOrders(query) {

        var d = deferred();

        var order = query.order,
            limit = parseInt(query.limit),
            page = query.page,
            filter = JSON.parse(query.filter);

        if (filter.hasOwnProperty('createdDate')) {

            var date = new Date(filter.createdDate).toDateString();
            var offset = Moment().tz('Asia/Jerusalem').utcOffset();
            var dayStart = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').toDate();
            var dayEnd = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').add(1, 'd').toDate();
            filter.createdDate = {
                "$gt": dayStart,
                "$lt": dayEnd
            };
        }

        if (filter.hasOwnProperty('orderId')) {
            filter.orderId = parseInt(filter.orderId);
        }

        if (filter.hasOwnProperty('branchId')) {
            filter.branchId = parseInt(filter.branchId);
        }

        var sortField = (query.order.indexOf('-') === -1) ? query.order : query.order.substr(1);
        var sortOrder = (query.order.indexOf('-') === -1) ? 'asc' : 'desc'

        var options = {
            "limit": limit,
            "skip": (page - 1) * limit,
            "sort": [
                [sortField, sortOrder]
            ]
        };

        DAL.getAllOrders(filter, options).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getOrder(orderId) {

        var d = deferred();

        DAL.getOrder(orderId).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getAllOrdersCount(filter) {

        var d = deferred();

        if (filter.hasOwnProperty('createdDate')) {

            var date = new Date(filter.createdDate).toDateString();
            var offset = Moment().tz('Asia/Jerusalem').utcOffset();
            var dayStart = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').toDate();
            var dayEnd = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').add(1, 'd').toDate();
            filter.createdDate = {
                "$gt": dayStart,
                "$lt": dayEnd
            };
        }

        if (filter.hasOwnProperty('orderId')) {
            filter.orderId = parseInt(filter.orderId);
        }

        DAL.getAllOrdersCount(filter).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function checkBranchCode(code) {

        var d = deferred();

        DAL.checkBranchCode(code).then(function (branch) {
            if (branch) {

                // if not test user
                if (branch.serialNumber !== 3333) {
                    // create random code, 5 digits length, the first digits allways be the branch serial code
                    var branchSerial = branch.serialNumber.toString();
                    var newCode = branchSerial + Math.random().toString().slice(2, 2 + 5 - branchSerial.length);
                    DAL.changeBranchCode(branch._id, newCode);
                }
                d.resolve(branch);
            } else {
                d.resolve('not-found');
            }
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function updateUserLastSeenTime(id, date) {

        var d = deferred();

        DAL.updateUserLastSeenTime(id, new Date(date)).then(function (result) {
            DAL.getConfigValue("lastCatalogUpdate").then(function (result) {
                d.resolve(result);
            });
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getAllTodayOrders() {

        var d = deferred();

        DAL.getAllTodayOrders().then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function saveDistribution(distributionList) {

        var d = deferred();


        var date = new Date();
        var offset = Moment().tz('Asia/Jerusalem').utcOffset();
        var currDate = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').toDate();

        distributionList.forEach(function(element) {
            element.createdDate = currDate;
        }, this);

        DAL.saveDistribution(distributionList).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getSuppliers() {

        var d = deferred();

        DAL.getSuppliers().then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function addSupplier(supplier) {

        var d = deferred();

        DAL.addSupplier(supplier).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function updateSupplier(supplier) {

        var d = deferred();

        DAL.updateSupplier(supplier).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function editDepartment(department) {

        var d = deferred();

        DAL.editDepartment(department).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function getDepartments() {

        var d = deferred();

        DAL.getDepartments().then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    function markItemsAsDistrebuted(items) {

        var d = deferred();

        // TODO: compleate this function !!!!

        //DAL.getDepartments(items).then(function (result) {
        d.resolve();
        //}, function (error) {
        //    d.deferred(error);
        //});

        return d.promise;
    }

    function getDistributedItems(filter) {

        var d = deferred();

        filter = JSON.parse(filter);

        var date = new Date().toDateString();
        var offset = Moment().tz('Asia/Jerusalem').utcOffset();
        var dayStart = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').toDate();
        var dayEnd = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').add(1, 'd').toDate();
        filter["createdDate"] = {
            "$gt": dayStart,
            "$lt": dayEnd
        };

        DAL.getDistributedItems(filter).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }


})(module.exports);