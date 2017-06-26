module.exports = function (server) {

    var self = this;
    var io = require('socket.io').listen(server);
    var _socket = null;

    var users = [];
    io.on('connection', function (socket) {
        _socket = socket;
    });

    var sendNewClientToAdmin = function(client){
        console.log('sending new client to admin: ', client);
        if (_socket !== null) {
            _socket.emit('newClient', client);        
        }
    }

    var sendUpdateToAdmin = function(updateObj){
        console.log('updating admin : ', updateObj);
        if (_socket !== null) {
            _socket.emit('updateClientsStatus', updateObj);        
        }
    }

    return {
        sendNewClientToAdmin: sendNewClientToAdmin,
        sendUpdateToAdmin: sendUpdateToAdmin
    }
    
};