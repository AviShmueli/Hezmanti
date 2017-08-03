/*jshint esversion: 6 */

(function (DAL) {

    DAL.getNextSequence = getNextSequence;
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
    DAL.checkBranchCode = checkBranchCode;
    DAL.changeBranchCode = changeBranchCode;
    DAL.updateUserLastSeenTime = updateUserLastSeenTime;
    DAL.getAllTodayOrders = getAllTodayOrders;
    DAL.saveDistribution = saveDistribution;
    DAL.getConfigValue = getConfigValue;
    DAL.getSuppliers = getSuppliers;
    DAL.addSupplier = addSupplier;
    DAL.updateSupplier = updateSupplier;
    DAL.editDepartment = editDepartment;
    DAL.getDepartments = getDepartments;

    var Moment = require('moment-timezone');
    var deferred = require('deferred');
    var mongodb = require('mongodb').MongoClient;
    var ObjectID = require('mongodb').ObjectID;
    var mongoUrl = 'mongodb://admin:avi3011algo@ds127059-a1.mlab.com:27059/algotodo_db_01?replicaSet=rs-ds127059';
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

    function getNextSequence(orderId) {

        var d = deferred();

        getCollection('counters').then(function (mongo) {

            mongo.collection.findAndModify({
                    _id: orderId
                }, [
                    ['_id', 'asc']
                ], {
                    $inc: {
                        seq: 1
                    }
                }, {
                    new: true
                },
                function (err, results) {

                    if (err) {
                        var errorObj = {
                            message: "error while trying to add new Task to DB",
                            error: err
                        };
                        mongo.db.close();
                        d.reject(errorObj);
                    }

                    mongo.db.close();
                    d.resolve(results.value.seq);

                });
        });

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

        getCollection('gorme-departments').then(function (mongo) {

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

            mongo.collection.find(filter, options).toArray(function (err, result) {
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

    function checkBranchCode(code) {

        var d = deferred();

        getCollection('gorme-branches').then(function (mongo) {

            mongo.collection.findOne({
                'accessCode': code
            }, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to check if branch code is valid: ",
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

    function changeBranchCode(branchId, newCode) {

        var d = deferred();

        getCollection('gorme-branches').then(function (mongo) {

            mongo.collection.update({
                '_id': new ObjectID(branchId)
            }, {
                $set: {
                    'accessCode': newCode
                }
            }, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to update branch code: ",
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

    function updateUserLastSeenTime(branchId, date) {

        var d = deferred();

        getCollection('gorme-branches').then(function (mongo) {

            mongo.collection.update({
                '_id': new ObjectID(branchId)
            }, {
                $set: {
                    'lastSeen': date
                }
            }, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to update branch: ",
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

    function getAllTodayOrders() {

        var d = deferred();

        var filter = {};

        var date = new Date().toDateString();
        var offset = Moment().tz('Asia/Jerusalem').utcOffset();
        var dayStart = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').toDate();
        var dayEnd = Moment(date).tz('Asia/Jerusalem').add(offset, 'm').add(1, 'd').toDate();
        filter.createdDate = {
            "$gt": dayStart,
            "$lt": dayEnd
        };

        getCollection('gorme-orders').then(function (mongo) {

            mongo.collection.find(filter, {
                branchId: 1,
                createdDate: 1,
                items: 1
            }).toArray(function (err, result) {
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

    function saveDistribution(distributionList) {
        var d = deferred();

        getCollection('gorme-distribution').then(function (mongo) {

            mongo.collection.insert(distributionList, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to add distributions : ",
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

    function getConfigValue(key) {
        var d = deferred();

        getCollection('gorme-config').then(function (mongo) {

            mongo.collection.find({
                _id: key
            }).toArray(function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to get config : ",
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

    function getSuppliers() {
        var d = deferred();

        getCollection('gorme-suppliers').then(function (mongo) {

            mongo.collection.find({}).toArray(function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to get suppliers : ",
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

    function addSupplier(supplier) {
        var d = deferred();

        getCollection('gorme-suppliers').then(function (mongo) {

            mongo.collection.insert(supplier, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to add supplier : ",
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

    function updateSupplier(supplier) {
        var d = deferred();

        var id = new ObjectID(supplier._id);
        delete supplier._id;

        getCollection('gorme-suppliers').then(function (mongo) {

            mongo.collection.findAndModify({
                _id: id
            }, [
                ['_id', 'asc']
            ], {
                $set: supplier
            }, {
                new: true
            }, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to update supplier : ",
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

    function editDepartment(department) {
        var d = deferred();

        var id = new ObjectID(department._id);
        delete department._id;

        getCollection('gorme-departments').then(function (mongo) {

            mongo.collection.findAndModify({
                _id: id
            }, [
                ['_id', 'asc']
            ], {
                $set: department
            }, {
                new: true
            }, function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to update department : ",
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

    function getDepartments() {
        var d = deferred();

        getCollection('gorme-departments').then(function (mongo) {

            mongo.collection.find({}).toArray(function (err, result) {
                if (err) {
                    var errorObj = {
                        message: "error while trying to get departments : ",
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