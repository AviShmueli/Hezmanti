﻿/*jshint esversion: 6 */

process.env.TZ = 'Asia/Jerusalem' 

var express = require('express');
var BL = require('./BL');
var DAL = require('./DAL');
var logger = require('./logger');
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
    BL.getAllBranches().then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getCatalog', function (req, res) {
    BL.getCatalog().then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/searchItems', function (req, res) {
    BL.searchItems(req.query.searchString).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getOrder', function (req, res) {
    BL.getOrder(req.query.orderId).then(function(result){
        res.send(result);
    }, function(error){
        logger.log('error', error.message , error.error);
        res.status(500).send(error); 
    });
});

app.post('/api/addOrder', function (req, res) {
    BL.addOrder(req.body.order).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/updateUserLastSeenTime', function (req, res) {
    BL.updateUserLastSeenTime(req.body.id, req.body.date).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/updateOrder', function (req, res) {
    BL.updateOrder(req.body.order).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getAllOrdersCount', function (req, res) {

    var filter = JSON.parse(req.query.filter);

    BL.getAllOrdersCount(filter).then(function(result) {
        res.send(result.toString()); 
    }, function(error) {
        logger.log('error', error.message , error.error);
        res.status(500).send(error); 
    });

});

app.get('/api/getAllOrders', function (req, res) {
    BL.getAllOrders(req.query).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/checkBranchCode', function (req, res) {
    BL.checkBranchCode(req.query.code).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getAllTodayOrders', function (req, res) {
    BL.getAllTodayOrders().then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/saveDistribution', function (req, res) {
    var distributionList = JSON.parse(req.body.distributionList);
    BL.saveDistribution(distributionList).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getSuppliers', function (req, res) {
    BL.getSuppliers().then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/addSupplier', function (req, res) {
    BL.addSupplier(req.body.supplier).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/updateSupplier', function (req, res) {
    BL.updateSupplier(req.body.supplier).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/editDepartment', function (req, res) {
    BL.editDepartment(req.body.department).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getDepartments', function (req, res) {
    BL.getDepartments().then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.post('/api/markItemsAsDistrebuted', function (req, res) {
    BL.markItemsAsDistrebuted(req.body.items).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

app.get('/api/getDistributedItems', function (req, res) {
    BL.getDistributedItems(req.query.filter).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

//var newBranches =  

//DAL.insertToCatalog(newBranches);
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