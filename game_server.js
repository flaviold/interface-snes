var express = require('express');
var app 	= express();
var server 	= require('http').Server(app);
var path	= require('path');
var io 		= require('socket.io')(server);
var uid		= require('uid');
var port	= process.env.PORT || 8000;
var GetIp	= require('ipware')().get_ip;

var GameInstance = require('./game_instance');
var SocketManager = require('./socket_manager');
var games = {};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	var id; // = uid(10);
	var ip = GetIp(req).clientIp;

	console.log(ip);

	if (!games[ip]) {
		console.log('new game created for user with ip: ' + ip);
		games[ip] = {}
		games[ip].id = id = uid(10);
		games[ip].gameInstance = new GameInstance(id, io);
	} else {
		console.log('existing game for user with ip: ' + ip);
		id = games[ip].id
	}

	res.render('index', {
		id: id,
		port: port
	});
	res.end();
});

module.exports.listen = function (callback) {
	server.listen(port, function () {
		callback(port);
	});
};