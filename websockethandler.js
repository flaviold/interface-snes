var WebSocketServer  = require('websocket').server;
var User = require('./user');
var uid	= require('uid');

module.exports.listenServer = function (server, port) {
    var self = this;
    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    this.users = {}

    wsServer.on('request', function (request) {
        var path = request.resourceURL.path.substring(1, request.resourceURL.path.length);
        var type = path.substring(0, path.indexOf('/'));
        
        var connection = request.accept();
        
        if (type == 'browser') {
            var newId = uid(10);
            self.users[id] = new User(port, id);
            self.users[id].RegisterBrowserSocket(connection);
        }

        if (type == 'emulator') {
            var id = path.substring(path.indexOf('/') + 1);
            if (self.users[id]) {
                self.users[id].RegisterEmulatorSocket(connection);
            }
        }
    });
};
