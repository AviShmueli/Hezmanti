(function (logger) {

    logger.log = log;

    var winston = require('winston');
    require('winston-loggly-bulk');


  /*  winston.add(winston.transports.Loggly, {
        token: "77e961f4-4296-4ee1-9521-2961b83aed0a	",
        subdomain: "hezmanti",
        tags: ["SERVER"],
        json:true
    });

*/

     winston.add(winston.transports.File, {
        filename: 'joshlog.log',
        level: 'info',
        eol: '\r\n',
        json:true,
        timestamp: true
    });

    function log(type, message, object){
        winston.log(type, message, object);
    }

})(module.exports);