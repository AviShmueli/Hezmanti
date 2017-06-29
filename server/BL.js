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

        DAL.addOrder(order).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
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

        var options = {
            "limit": limit,
            "skip": (page - 1) * limit
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

        DAL.getAllOrdersCount(filter).then(function (result) {
            d.resolve(result);
        }, function (error) {
            d.deferred(error);
        });

        return d.promise;
    }

    

})(module.exports);