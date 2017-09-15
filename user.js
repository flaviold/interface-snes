var Experiment = require('./experiment');

module.exports = function (port, id, connection) {
    var self = this;
    this.browserMessageBuffer = '';
    this.actions = {
        Start: function (message) {
            self.experiment = new Experiment(connection);

            self.openEmulator();
        },

        Command: function (message) {
            if (self.gameSocket) {
                self.gameSocket.sendUTF(message)
            }
            var command = message.substring(message.indexOf('|') + 1);
            if (self.experiment) {
                self.experiment.insertSample(command, self.currentImage);
            }
        },

        Image: function (message) {
            if (self.browserSocket) {
                self.browserSocket.sendUTF(message);
                self.currentImage = message.substring(message.indexOf('|') + 1);
            }
        },

        GameOver: function (message) {
            if (self.browserSocket) {
                self.browserSocket.sendUTF(message);
            }

            if (self.gameProcess) {
                self.gameProcess.kill('SIGKILL');
            }

            var result = message.substring(message.indexOf('|') + 1);
            if (self.experiment) {
                self.experiment.setExperimentAsFinished(result);
            }
        }
    };

    this.registerBrowser = function (browserSocket) {
        self.browserSocket = browserSocket;
        browserSocket.on('message', function(messageData) {
            var message = messageData.utf8Data;
            if (message.type === 'utf8') {
                if (message[message.length - 1] != '\n')
                {
                    self.browserMessageBuffer += message;
                    return;
                }
                if (message.split('|').length <= 1
                    && !self.browserMessageBuffer
                    && self.browserMessageBuffer.split('|')[1] == "Image")
                {
                    self.browserMessageBuffer += message;
                    message = self.browserMessageBuffer;
                    self.browserMessageBuffer = '';
                }
    
                message = message.substring(0, message.length - 1);
                self.HandleServerActions(messageWithNoType);
                //connection.sendUTF(message.utf8Data);
            }
        });
        browserSocket.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    };

    this.registerGame = function (gameSocket) {
        self.gameSocket = gameSocket;
        gameSocket.on('message', function(messageData) {
            var message = messageData.utf8Data;
            if (message.type === 'utf8') {
                if (message[message.length - 1] != '\n')
                {
                    self.gameMessageBuffer += message;
                    return;
                }
                if (message.split('|').length <= 1
                    && !self.gameMessageBuffer
                    && self.gameMessageBuffer.split('|')[1] == "Image")
                {
                    self.gameMessageBuffer += message;
                    message = self.gameMessageBuffer;
                    self.gameMessageBuffer = '';
                }
    
                message = message.substring(0, message.length - 1);
                self.HandleServerActions(messageWithNoType);
            }
        });
        gameSocket.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
        if (self.experiment) {
            var startMessage = 'StartWithSettings|' + self.experiment.p1 + '' + self.experiment.p2 + '' + self.experiment.level;
            gameSocket.sendUTF(startMessage);
        }
    };

    this.HandleServerActions = function (message) {
        var action = message.substring(0, message.indexOf('|'));
        if (self.actions[action]) {
            self.actions[action](message);
        }
    };

    this.openEmulator = function() {
        self.gameProcess = spawn('./emulator/snes9x' ,[id, 'emulator/Street-Fighter-II-The-World-Warrior-USA.sfc']);
    };
};