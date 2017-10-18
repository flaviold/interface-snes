var Experiment = require('./experiment');
var spawn = require('child_process').spawn;
var maxGames = require('./settings').maxGamesConcurrentlyPlaying;
var pathEmulator = require('./settings').emulatorPath;
var pathExperiments = require('./settings').experimentPaths;
var fs = require('fs');

module.exports = function (port, id) {
    var self = this;
    var date = new Date();
    this.browserMessageBuffer = '';
    this.emulatorMessageBuffer = '';
    this.path = pathExperiments 
    + 'experiment-'
    + date.getDate() + '-' 
    + date.getMonth() + '-'
    + date.getFullYear() + '-'
    + this.id + '/';

    if (!fs.existsSync(this.path)){
        fs.mkdirSync(this.path);
    }

    this.actions = {
        Start: function (obj) {
            if (currentGamesCount >= maxGames) {
                var error = {};
                error.action = 'Error'
                error.message = 'maxGames'
                self.browserSocket.sendUTF(JSON.stringify(error));
                return;
            }

            if (self.gameProcess) {
                self.experiment = undefined;
                self.emulatorSocket = undefined;
                self.gameProcess.kill('SIGKILL');
            } else {
                currentGamesCount++;
            }
            
            self.experiment = new Experiment(self.path, function () {
                self.StartEmulator();
            });
        },

        Command: function (obj) {
            if (self.emulatorSocket) {
                self.emulatorSocket.sendUTF('Command|' + obj.command);
                if (self.currentImage) {
                    self.experiment.insertSample(self.currentFrame, obj.command, self.currentImage);
                }
            }
        },

        Game: function (obj) {
            self.currentImage = obj.image;
            self.currentFrame = obj.frame;

            if (self.browserSocket) {
                self.browserSocket.sendUTF(JSON.stringify(obj));
            }
        },

        Stop: function (obj) {
            if (self.gameProcess) {
                self.emulatorSocket = undefined;
                self.gameProcess.kill('SIGKILL');
            }
            currentGamesCount--;
        }
    };

    this.RegisterBrowserSocket = function (browserSocket) {
        self.browserSocket = browserSocket;
        browserSocket.on('message', function (messageData) {
            if (messageData.type === 'utf8') {
                var message = messageData.utf8Data;
                if (message.indexOf('}') < 0) {
                    self.browserMessageBuffer += message;
                    return;
                }
                if (message.indexOf('{') != 0) {
                    self.browserMessageBuffer += message;
                    message = self.browserMessageBuffer;
                    self.browserMessageBuffer = '';
                }

                var obj = JSON.parse(message);
                self.HandleServerActions(obj);
            }
            else if (messageData.type === 'binary') {
                console.log('Received Binary Message of ' + messageData.binaryData.length + ' bytes');
                browserSocket.sendBytes(messageData.binaryData);
            }
        });
        browserSocket.on('close', function (reasonCode, description) {
            console.log((new Date()) + ' Peer ' + browserSocket.remoteAddress + ' disconnected.');
            self.actions["Stop"]();
            delete self;
        });
    };

    this.RegisterEmulatorSocket = function (emulatorSocket) {
        self.emulatorSocket = emulatorSocket
        emulatorSocket.on('message', function (messageData) {
            if (messageData.type === 'utf8') {
                var message = messageData.utf8Data;
                if (message.indexOf('}') < 0) {
                    self.browserMessageBuffer += message;
                    return;
                }
                if (message.indexOf('{') != 0) {
                    self.browserMessageBuffer += message;
                    message = self.browserMessageBuffer;
                    self.browserMessageBuffer = '';
                }
                
                var obj = JSON.parse(message);
                self.HandleServerActions(obj);
            }
            else if (messageData.type === 'binary') {
                console.log('Received Binary Message of ' + messageData.binaryData.length + ' bytes');
                emulatorSocket.sendBytes(messageData.binaryData);
            }
        });
        emulatorSocket.on('close', function (reasonCode, description) {
            console.log((new Date()) + ' Peer ' + emulatorSocket.remoteAddress + ' disconnected.');
        });
    };

    this.HandleServerActions = function (obj) {
        if (self.actions[obj.action]) {
            self.actions[obj.action](obj);
        }
    };

    this.StartEmulator = function() {
        self.gameProcess = spawn(pathEmulator + 'snes9x', [id, port, self.path, pathEmulator + 'Street-Fighter-II-The-World-Warrior-USA.sfc']);

        self.gameProcess.stdout.on('error', function (err) {
            console.log("Error: " + err);
        });
    };
};
