(function () {
    'use strict';

    angular
        .module('app')
        .service('dataContext', dataContext);

    dataContext.$inject = ['$rootScope', '$localStorage'];

    function dataContext($rootScope, $localStorage) {

        var self = this;
        self.$storage = $localStorage;

        var getClients = function () {
            return self.clientsList !== undefined ? self.clientsList : [];
        }

        var setClients = function (clients) {
            self.clientsList = clients;
        }

        var updateClientsStatus = function (clients, status) {
      
            var matchs = getClients().filter(function (obj) {
                return clients.indexOf(obj.id) !== -1;
            });

            for (var index = 0; index < matchs.length; index++) {
                matchs[index].isConnected = status;
            }

            $rootScope.$apply()
        }

        var addClient = function (client) {
            var clients = getClients();

            var matchs = clients.filter(function (obj) {
                return obj.id === client.id;
            });

            if (matchs.length < 1) {
                clients.push(client);
                $rootScope.$apply();
            }     
        }

        var setClientId = function(clientId){
            self.$storage.clientId = clientId;
        }

        var getClientId = function(clientId){
            return self.$storage.clientId || null;
        }

        var service = {
            getClients: getClients,
            setClients: setClients,
            updateClientsStatus: updateClientsStatus,
            addClient: addClient,
            setClientId: setClientId,
            getClientId: getClientId
        };

        return service;
    }

})();