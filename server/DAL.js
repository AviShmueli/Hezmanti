/*jshint esversion: 6 */

(function (DAL) {

    DAL.insertNewBranches = insertNewBranches;
    DAL.getAllBranches = getAllBranches;
    DAL.getCatalog = getCatalog;
    DAL.insertToCatalog = insertToCatalog;
    DAL.searchItems = searchItems;
    DAL.addOrder = addOrder;
    DAL.getAllOrders = getAllOrders;
    DAL.getOrder = getOrder;
    DAL.updateOrder = updateOrder;
    DAL.getAllOrdersCount = getAllOrdersCount;


    var deferred = require('deferred');
    var mongodb = require('mongodb').MongoClient;
    var ObjectID = require('mongodb').ObjectID;
    var mongoUrl = 'mongodb://admin:avi3011algo@ds127059-a0.mlab.com:27059/algotodo_db_01';
    //var mongoUrl = 'mongodb://admin:avi3011algo@ds033996.mlab.com:33996/algotodo_db_01';
    //var mongoUrl = 'mongodb://localhost:27017/Hezmanti';
    var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

    function getCollection(collectionName) {

        var d = deferred();

        try {
            mongodb.connect(mongoUrl, function (err, db) {

                if (err) {
                    var errorObj = {
                        message: "error while trying to connect MongoDB",
                        error: err
                    };
                    d.reject(errorObj);
                }
                if (db) {
                    d.resolve({
                        collection: db.collection(collectionName),
                        db: db
                    });
                }
            });
        } catch (error) {
            d.reject(error);
        }

        return d.promise;
    }

    function insertNewBranches(branches) {

        var d = deferred();

        getCollection('gorme-branches').then(function (mongo) {

            mongo.collection.insert(branches, function (err, results) {

                if (err) {
                    var errorObj = {
                        message: "error while trying to add new Task to DB",
                        error: err
                    };
                    mongo.db.close();
                    d.reject(errorObj);
                }

                mongo.db.close();
                d.resolve(results);

            });
        });

        return d.promise;
    }

    function insertToCatalog(catalog) {

        var d = deferred();

        getCollection('gorme-catalog').then(function (mongo) {

            mongo.collection.insert(catalog, function (err, results) {

                if (err) {
                    var errorObj = {
                        message: "error while trying to add new Task to DB",
                        error: err
                    };
                    mongo.db.close();
                    d.reject(errorObj);
                }

                mongo.db.close();
                d.resolve(results);

            });
        });

        return d.promise;
    }

    function getAllBranches() {
        var d = deferred();

        getCollection('gorme-branches').then(function (mongo) {

            mongo.collection.find({}).toArray(
                function (err, result) {
                    if (err) {
                        var errorObj = {
                            message: "error while trying to get all Branches: ",
                            error: err
                        };
                        mongo.db.close();
                        d.reject(errorObj);
                    }

                    mongo.db.close();
                    d.resolve(result);
                });
        });

        return d.promise;
    }

    function getCatalog() {
        var d = deferred();

        getCollection('gorme-catalog').then(function (mongo) {

            mongo.collection.find({
                priority: {
                    $lte: 20
                }
            }).toArray(
                function (err, result) {
                    if (err) {
                        var errorObj = {
                            message: "error while trying to get Catalog: ",
                            error: err
                        };
                        mongo.db.close();
                        d.reject(errorObj);
                    }

                    mongo.db.close();
                    d.resolve(result);
                });
        });

        return d.promise;
    }

    function searchItems(searchString) {
        var d = deferred();

        getCollection('gorme-catalog').then(function (mongo) {

            mongo.collection.find({
                'name': {
                    "$regex": searchString,
                    "$options": "i"
                }
            }).toArray(
                function (err, result) {
                    if (err) {
                        var errorObj = {
                            message: "error while trying to search Items: ",
                            error: err
                        };
                        mongo.db.close();
                        d.reject(errorObj);
                    }

                    mongo.db.close();
                    d.resolve(result);
                });
        });

        return d.promise;
    }

    function addOrder(order) {
        var d = deferred();

        getCollection('gorme-orders').then(function (mongo) {

            mongo.collection.insert(order, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to add Order: ",
                        error: err
                    };
                    mongo.db.close();
                    d.reject(errorObj);
                }

                mongo.db.close();
                d.resolve(result);
            });
        });

        return d.promise;
    }

    function updateOrder(order) {
        var d = deferred();

        var orderId = order._id;

        delete order._id;

        getCollection('gorme-orders').then(function (mongo) {



            mongo.collection.findAndModify({
                    _id: new ObjectID(orderId)
                }, [
                    ['_id', 'asc']
                ], {
                    $set: order
                }, {
                    new: true
                },
                function (err, results) {

                    if (err) {
                        var errorObj = {
                            message: "error while trying to update Order :",
                            error: err
                        };
                        mongo.db.close();
                        d.reject(errorObj);
                    }

                    mongo.db.close();
                    d.resolve(results);
                });
        });

        return d.promise;
    }

    function getAllOrders(filter, options) {
        var d = deferred();

        getCollection('gorme-orders').then(function (mongo) {

            mongo.collection.find(filter, options).sort({
                createdTime: -1
            }).toArray(function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to get all Orders: ",
                        error: err
                    };
                    mongo.db.close();
                    d.reject(errorObj);
                }

                mongo.db.close();
                d.resolve(result);
            });
        });

        return d.promise;
    }

    function getOrder(orderId) {
        var d = deferred();

        getCollection('gorme-orders').then(function (mongo) {

            mongo.collection.findOne({
                _id: new ObjectID(orderId)
            }, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to get Order: ",
                        error: err
                    };
                    mongo.db.close();
                    d.reject(errorObj);
                }

                mongo.db.close();
                d.resolve(result);
            });
        });

        return d.promise;
    }

    function getAllOrdersCount(filter) {

        var d = deferred();

        getCollection('gorme-orders').then(function (mongo) {

            mongo.collection.count(filter, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to get All orders count: ",
                        error: err
                    };
                    mongo.db.close();
                    d.reject(errorObj);
                }

                mongo.db.close();
                d.resolve(result);
            });
        });

        return d.promise;
    }

})(module.exports);

/*

        var d = deferred();

        getCollection('users').then(function (mongo) {

            mongo.collection.findOne({},
            function (err, result) {
                    if (err) {
                        var errorObj = {
                            message: "error while trying to ... ",
                            error: err
                        };
                        mongo.db.close();
                        d.reject(errorObj);
                    }

                    mongo.db.close();
                    d.resolve(result);
                });
        });

        return d.promise;

 */