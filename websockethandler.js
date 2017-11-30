var WebSocketServer  = require('websocket').server;
var User = require('./user');
var uid	= require('uid');
var os = require('os');
var spawn = require('child_process').spawn;
var jsonfile = require('jsonfile');

module.exports.listenServer = function (server, port) {
    var self = this;
    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });
    this.statusObj = {};

    this.users = {};

    this.CPUPercent = function (callback) {
        var cpuData = spawn('bash', ['cpu.sh']);
        
        cpuData.stdout.on('data', function (data) {
            callback(parseFloat(data));
        });
    };

    this.RAMPercent = function () {
        return 100*(1 - (os.freemem()/os.totalmem()));
    };

    wsServer.on('request', function (request) {
        var path = request.resourceURL.path.substring(1, request.resourceURL.path.length);
        var type = path.substring(0, path.indexOf('/'));
        
        var connection = request.accept();
        
        if (type == 'browser') {
            var newId = uid(10);
            console.log("WS::User Connected::" + newId);
            self.users[newId] = new User(port, newId, function () {
                console.log("WS::User Disconnected::" + newId);
                delete self.users[newId];
            });
            self.users[newId].RegisterBrowserSocket(connection);
        }

        if (type == 'emulator') {
            var id = path.substring(path.indexOf('/') + 1);
            if (self.users[id]) {
                self.users[id].RegisterEmulatorSocket(connection);
            }
        }

        if (type == 'status') {
            var date = new Date();
            var status = [];
            connection.on('message', function (messageData) {
                if (messageData.type === 'utf8') {
                    var message = messageData.utf8Data;
                    self.CPUPercent(function (CPU) {
                        var obj = {}
                        var usersKey = Object.keys(self.users);
                        obj.totalUsers = 0;
                        usersKey.forEach(function (item) {
                            if (self.users[item] && self.users[item].gameProcess) {
                                obj.totalUsers++;
                            }
                        });
                        obj.CPU = CPU;
                        obj.RAM = self.RAMPercent();
                        connection.sendUTF(JSON.stringify(obj));
                        status.push(obj);
                    });
                }
            });
            connection.on('close', function () {
                jsonfile.writeFile(uid(10) + '.json', status, function (err) {
                    if (err) {
                        console.log(err)
                    }
                })
            });
        }
    });
};
