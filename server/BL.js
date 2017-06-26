/*jshint esversion: 6 */

(function (BL) {

    BL.getAllBranches = getAllBranches;

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

})(module.exports);