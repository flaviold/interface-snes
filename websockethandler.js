var mysql = require('mysql');
var WebSocketServer  = require('websocket').server;
var User = require('./user');

module.exports.listenServer = function (server, port) {
    var self = this;
    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    this.users = {}

    this.connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'snes',
		password : '123456',
		database : 'snesdb'
	});

    wsServer.on('request', function (request) {
        var path = request.resourceURL.path.substring(1, request.resourceURL.path.length);
        var type = path.substring(0, path.indexOf('/'));
        var id = path.substring(path.indexOf('/') + 1);
        
        var connection = request.accept();
        
        if (type == 'browser') {
            if (!self.users[id]) {
                self.users[id] = new User(port, id, self.connection);
                self.users[id].RegisterBrowserSocket(connection);
            }
        }

        if (type == 'emulator') {
            if (self.users[id]) {
                self.users[id].RegisterEmulatorSocket(connection);
            }
        }
    });
};