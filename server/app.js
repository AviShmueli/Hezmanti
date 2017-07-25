/*jshint esversion: 6 */

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
    BL.saveDistribution(req.body.distributionList).then(function (result) {
        res.send(result);
    }, function (error) {
        logger.log('error', error.message, error.error);
        res.status(500).send(error);
    });
});

var newBranches = [
  {
    "supplierId": 30000,
    "name": "מילועוף"
  },
  {
    "supplierId": 30004,
    "name": "א.ב איכות הבשר"
  },
  {
    "supplierId": 30006,
    "name": "אורן דרזי"
  },
  {
    "supplierId": 30012,
    "name": "דבאח"
  },
  {
    "supplierId": 30015,
    "name": "צדקה יוסף"
  },
  {
    "supplierId": 30024,
    "name": "בקר תנובה"
  },
  {
    "supplierId": 30027,
    "name": "עוף ירושלים"
  },
  {
    "supplierId": 30033,
    "name": "נטו"
  },
  {
    "supplierId": 30034,
    "name": "קוסדא"
  },
  {
    "supplierId": 30044,
    "name": "טל הל יסכה"
  },
  {
    "supplierId": 30047,
    "name": "טכנו שק"
  },
  {
    "supplierId": 30048,
    "name": "דגת הארץ - אגודה שיתופית חקלאית בע\"מ"
  },
  {
    "supplierId": 30050,
    "name": "עוף טוב (שאן) בע\"מ"
  },
  {
    "supplierId": 30051,
    "name": "מאסטרפוד בע\"מ"
  },
  {
    "supplierId": 30060,
    "name": "ד. שוחט סחר בקר בע\"מ"
  },
  {
    "supplierId": 30064,
    "name": "תנובה בע\"מ"
  },
  {
    "supplierId": 30068,
    "name": "יהודה ניב-שיווק מוצרי בשר ומזון"
  },
  {
    "supplierId": 30069,
    "name": "נחמיה לחוביץ בע\"מ"
  },
  {
    "supplierId": 30098,
    "name": "חמים וטעים בע\"מ"
  },
  {
    "supplierId": 30107,
    "name": "בלדי בע\"מ"
  },
  {
    "supplierId": 30119,
    "name": "דניאל דני מוצרי בשר בע\"מ"
  },
  {
    "supplierId": 30158,
    "name": "עוף עוז (שיווק) בע\"מ"
  },
  {
    "supplierId": 30173,
    "name": "ציון שמכה ובניו בע\"מ"
  },
  {
    "supplierId": 30178,
    "name": "ח.ש. בקרנה בשר הכפר בע\"מ"
  },
  {
    "supplierId": 30221,
    "name": "כרדי ובניו בע\"מ"
  },
  {
    "supplierId": 30232,
    "name": "ג'י.טי.סי חברה כללית למסחר בע\"מ"
  },
  {
    "supplierId": 30239,
    "name": "איילות תוצרת חקלאית בע\"מ"
  },
  {
    "supplierId": 30422,
    "name": "סנו פרופשיונל בע\"מ"
  },
  {
    "supplierId": 30528,
    "name": "לוגיסטימן"
  },
  {
    "supplierId": 30572,
    "name": "לב ים שיווק דגים בע\"מ"
  },
  {
    "supplierId": 30573,
    "name": "לב ים שיווק דגים בע\"מ"
  }
];

DAL.insertToCatalog(newBranches);
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