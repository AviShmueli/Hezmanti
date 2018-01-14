(function () {
    'use strict';

    angular
        .module('app')
        .service('device', device);

    device.$inject = [];

    function device() {

        var self = this;
        console.log('device-services');
        var isMobileDevice = function () {
            return document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
        };

        var getImagesPath = function () {

            if (!isMobileDevice()) {
                return '';
            }

            var appDirectory = 'file:///android_asset/';//self.appDir;
            return appDirectory + 'www';
        }

        var setAppDir = function(appDir){
            self.appDir = appDir;
        }

        var service = {
            getImagesPath: getImagesPath,
            isMobileDevice: isMobileDevice,
            setAppDir: setAppDir
        };

        return service;
        
    }

})();