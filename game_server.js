var express = require('express');
var app 	= express();
var server 	= require('http').Server(app);
var path	= require('path');
var uid		= require('uid');
var port	= process.env.PORT || 8000;
var GetIp	= require('ipware')().get_ip;
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
	var id = uid(10);
	var ip = GetIp(req).clientIp;

	console.log(ip);

	res.render('index', {
		id: id,
		port: port
	});
	res.end();
});

webSocketHandler.listenServer(server, port);

module.exports.listen = function (callback) {
	server.listen(port, function () {
		callback(port);
	});
};