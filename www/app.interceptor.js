(function () {
    'use strict';

    angular
        .module('app')
        .factory('appInterceptor', appInterceptor);

    function appInterceptor(device, SERVER_URL) {
        return {
            request: function (config) {
                console.log("appInterceptor",'  Config= ',config   );
                if (device.isMobileDevice() && config.url.indexOf('/api/') !== -1) {
                    config.url = SERVER_URL + config.url;
                }
                return config;
            }
        }
    }

}());