var Experiment = require('./experiment');
var spawn = require('child_process').spawn;
var maxGames = require('./settings').maxGamesConcurrentlyPlaying;
var pathEmulator = require('./settings').emulatorPath;

module.exports = function (port, id) {
    var self = this;
    this.browserMessageBuffer = '';
    this.emulatorMessageBuffer = '';

    this.actions = {
        Start: function (message) {
            if (currentGamesCount >= maxGames) {
                self.browserSocket.sendUTF("Error|maxGames");
                return;
            }

            currentGamesCount++;
            if (self.gameProcess) {
                self.experiment = undefined;
                self.emulatorSocket = undefined;
                self.gameProcess.kill('SIGKILL');
            }
            var settings = message.split('|')[1];
            var p1 = settings.substring(0, 1);
            var p2 = settings.substring(1, 2);
            var lvl = settings.substring(2, 3);
            self.experiment = new Experiment(p1, p2, lvl, function () {
                self.StartEmulator();
            });
        },

        Command: function (message) {
            command = message.substring(message.indexOf('|') + 1);
            if (self.emulatorSocket) {
                self.emulatorSocket.sendUTF(message);
                if (self.currentImage) {
                    self.experiment.insertSample(command, self.currentImage, self.p1Life, self.p2Life, self.gameTimer);
                }
            }
        },

        Game: function (message) {
            self.p1Life = message.split('|')[1];
            self.p2Life = message.split('|')[2];
            self.gameTimer = message.split('|')[3];
            self.currentImage = message.split('|')[4];

            if (self.browserSocket) {
                self.browserSocket.sendUTF('Image|' + self.currentImage);
            }
        },

        Stop: function (message) {
            if (self.gameProcess) {
                self.emulatorSocket = undefined;
                self.gameProcess.kill('SIGKILL');
            }
            currentGamesCount--;
        },

        GameOver: function (message) {
            var result = message.substring(message.indexOf('|') + 1);
            if (self.gameProcess) {
                self.gameProcess.kill('SIGKILL');
            }

            if (self.browserSocket) {
                self.browserSocket.sendUTF(message);
            }

            self.experiment.setExperimentAsFinished(result);
            currentGamesCount--;
        }
    };

    this.RegisterBrowserSocket = function (browserSocket) {
        self.browserSocket = browserSocket;
        browserSocket.on('message', function (messageData) {
            if (messageData.type === 'utf8') {
                var message = messageData.utf8Data;
                if (message[message.length - 1] != '\n') {
                    self.browserMessageBuffer += message;
                    return;
                }
                if (message.split('|').length <= 1
                    && !self.browserMessageBuffer
                    && self.browserMessageBuffer.Split('|')[1] == "Image") {
                    self.browserMessageBuffer += message;
                    message = self.browserMessageBuffer;
                    self.browserMessageBuffer = '';
                }

                message = message.substring(0, message.length - 1);
                self.HandleServerActions(message);
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
                if (message[message.length - 1] != '\n') {
                    self.browserMessageBuffer += message;
                    return;
                }
                if (message.split('|').length <= 1
                    && !self.browserMessageBuffer
                    && self.browserMessageBuffer.Split('|')[1] == "Image") {
                    self.browserMessageBuffer += message;
                    message = self.browserMessageBuffer;
                    self.browserMessageBuffer = '';
                }

                message = message.substring(0, message.length - 1);
                self.HandleServerActions(message);
            }
            else if (messageData.type === 'binary') {
                console.log('Received Binary Message of ' + messageData.binaryData.length + ' bytes');
                emulatorSocket.sendBytes(messageData.binaryData);
            }
        });
        emulatorSocket.on('close', function (reasonCode, description) {
            console.log((new Date()) + ' Peer ' + emulatorSocket.remoteAddress + ' disconnected.');
        });

        if (self.experiment) {
            emulatorSocket.sendUTF("StartWithSettings|" + self.experiment.experiment_obj.p1 + "" + self.experiment.experiment_obj.p2 + "" + self.experiment.experiment_obj.level);
        }
    };

    this.HandleServerActions = function (message) {
        var action = message.split('|')[0];
        if (self.actions[action]) {
            self.actions[action](message);
        }
    };

    this.StartEmulator = function() {
        self.gameProcess = spawn(pathEmulator + 'snes9x', [id, port, pathEmulator + 'Street-Fighter-II-The-World-Warrior-USA.sfc']);
        //spawn('~/.SnesInterface/snes9x', [id, port, '~/.SnesInterface/Street-Fighter-II-The-World-Warrior-USA.sfc']);
        // self.gameProcess.stdout.on('data', function (data) {
        //     console.log(id + " :: Emulator :: " + data);
        // });

        self.gameProcess.stdout.on('error', function (err) {
            console.log("Error: " + err);
        });
    };
};
