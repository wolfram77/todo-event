// required modules
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

// prepare
var app = express();
var server = http.createServer(app);
var root = __dirname+'/0';
var data = __dirname+'/data';
var mod = __dirname+'/node_modules';


// mappings
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.all('/', function(req, res) {
	res.sendFile(root+'/index.html');
});
app.use('/', express.static(root));
app.use('/mod', express.static(mod));
app.use(function(req, res) {
	res.send('invalid request!');
});


// done
server.listen(80, function() {
	console.log('oplus>> ready!');
});
