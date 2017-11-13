var Experiment = require('./experiment');
var spawn = require('child_process').spawn;
var settings = require('./settings');

module.exports = function (port, id, onDisconnect) {
    var self = this;
    this.browserMessageBuffer = '';
    this.emulatorMessageBuffer = '';

    this.actions = {
        Start: function (obj) {
            if (currentGamesCount >= settings.maxGamesConcurrentlyPlaying) {
                var error = {};
                error.action = 'Error'
                error.message = 'Server is full, try again later.'
                self.browserSocket.sendUTF(JSON.stringify(error));
                return;
            }
            
            console.log('User::'+ id +'::Experiment Started::' + (new Date()).toISOString());
            if (self.gameProcess) {
                self.experiment = undefined;
                self.emulatorSocket = undefined;
                self.gameProcess.kill('SIGKILL');
            } else {
                currentGamesCount++;
            }

            self.experiment = new Experiment(function () {
                self.StartEmulator();
            });
        },

        Command: function (obj) {
            if (self.emulatorSocket) {
                self.emulatorSocket.sendUTF('Command|' + obj.command);
                if (self.currentObj && self.currentObj.save) {
                    delete self.currentObj.save
                    delete self.currentObj.action
                    self.currentObj.command = obj.command
                    self.experiment.insertSample(self.currentObj);
                }
            }
        },

        Game: function (obj) {
            self.currentObj = obj;

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
        },

        GameOver: function () {
            var obj = {};
            obj.action = 'GameOver'
            self.browserSocket.sendUTF(JSON.stringify(obj));
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
        browserSocket.on('close', function (messageData) {
            self.actions["Stop"]();
            onDisconnect();
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
    };

    this.HandleServerActions = function (obj) {
        if (self.actions[obj.action]) {
            self.actions[obj.action](obj);
        }
    };

    this.StartEmulator = function() {
        self.gameProcess = spawn(settings.emulatorPath + settings.emulator, [id, port, settings.emulatorPath + 'sf2.sfc']);

        self.gameProcess.stdout.on('error', function (err) {
            console.log("Error: " + err);
        });

        self.gameProcess.on('close', function (code) {
            console.log('User::'+ id +'::Experiment Finished::' + (new Date()).toISOString());
            self.actions["GameOver"]();
        });
    };
};
