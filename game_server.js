var express = require('express');
var app 	= express();
var server 	= require('http').Server(app);
var path	= require('path');
var port	= process.env.PORT || 8000;
var webSocketHandler = require('./websockethandler');
var pathFiles = require('./settings').experimentPaths;
var fs = require('fs');

if (!fs.existsSync(pathFiles)){
    fs.mkdirSync(pathFiles);
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	var date = new Date();

	console.log("Page connection::" + date.toISOString());

	res.render('index', {
		port: port
	});
	res.end();
});

app.get('/status', function (req, res) {
	res.sendFile(path.join(__dirname, 'views/status.html'));
});

webSocketHandler.listenServer(server, port);

module.exports.listen = function (callback) {
	server.listen(port, function () {
		callback(port);
	});
};