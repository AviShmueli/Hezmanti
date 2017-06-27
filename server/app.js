/*jshint esversion: 6 */

var express = require('express');
var BL = require('./BL');
var DAL = require('./DAL');

var app = express();

var http = require('http');

var server = http.createServer(app);

//var socket = require('./socketIO')(server);

var bodyParser = require('body-parser');

var port = process.env.PORT || 5007;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static('./www'));
app.use(express.static('./bower_components'));
app.use(express.static('./node_modules'));

/* ---- Start the server ------ */
server.listen(process.env.PORT || 5007, function (err) {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


app.get('/api/getAllBranches', function (req, res) {
    BL.getAllBranches().then(function(result){
        res.send(result);
    }, function(error){
        winston.log('error', error.message , error.error);
        res.status(500).send(error); 
    });
});

app.get('/api/getCatalog', function (req, res) {
    BL.getCatalog().then(function(result){
        res.send(result);
    }, function(error){
        winston.log('error', error.message , error.error);
        res.status(500).send(error); 
    });
});

app.get('/api/searchItems', function (req, res) {
    BL.searchItems(req.query.searchString).then(function(result){
        res.send(result);
    }, function(error){
        winston.log('error', error.message , error.error);
        res.status(500).send(error); 
    });
});

app.get('/api/getAllOrders', function (req, res) {
    BL.getAllOrders().then(function(result){
        res.send(result);
    }, function(error){
        winston.log('error', error.message , error.error);
        res.status(500).send(error); 
    });
});

app.post('/api/addOrder', function (req, res) {
    BL.addOrder(req.body.order).then(function(result){
        res.send(result);
    }, function(error){
        winston.log('error', error.message , error.error);
        res.status(500).send(error); 
    });
});

//var catalog = 

//DAL.insertToCatalog(catalog);
//DAL.insertNewBranches(newBranches);

/*app.post('/registerNewClient', function (req, res) {
    
    var client = req.body.client;
    
    client['IP'] = getClientIP(req);

    if (!client.hasOwnProperty('id')) {        
        BL.registerNewClient(client);
        res.send(client);
        console.log('info', 'New client just connected to the app: ' , client);
    }
    else{
        BL.registerExistsClient(client);
        res.send(client);
        console.log('info', 'Client reconnected to the app: ' , client);
    }

    socket.sendNewClientToAdmin(client);
});

app.post('/keepMeAlive', function (req, res) {       
    BL.addClientToAliveList(req.body.clientId);
    res.send('ok');
});

app.get('/getClients', function (req, res) {
    var clients = BL.getClients()
    res.send(clients);
});*/



