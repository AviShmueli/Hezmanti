/*jshint esversion: 6 */

(function (BL) {

    BL.getAllBranches = getAllBranches;
    BL.getCatalog = getCatalog;
     BL.searchItems = searchItems;

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

})(module.exports);