var fs 	  		= require('fs');
var net	  		= require('net');
var spawn 		= require('child_process').spawn;
var mysql 		= require('mysql');
var Experiment 	= require('./experiment');

var instance 	= function (id, io) {
	this.gameSocketAddress = "/tmp/snes-socket-" + id + ".socket";
	this.chunk = "";
	
	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'snes',
		password : '123456',
		database : 'snesdb'
	});
	var self = this;

	this.disconnectGame = function () {
		if (self.gameProcess) {
			console.log(':: ' + id + ' :: Disconnect');
			fs.unlink(self.gameSocketAddress);
			self.gameProcess.kill('SIGHUP');
			delete self.gameProcess;
			delete self.gameSocket;
		}
	}

	this.startExperiment = function () {
		if (self.gameSocket) { return; }

		fs.unlink(self.gameSocketAddress, function () {
			var gameServer = net.createServer(function (socket) {
				self.gameSocket = socket;

				self.gameSocket.on('end', function () {
					self.disconnectGame();
					console.log(':: ' + id + ' :: Game :: End');
				});

				self.gameSocket.on('error', function () {
					self.disconnectGame();
					console.log(':: ' + id + ' :: Game :: Error :: ' + err);
					delete self.gameSocket;
				});

				if (self.browserSocket) {
					self.connectSockets();
				}
			});

			gameServer.listen(self.gameSocketAddress, function() {
				console.log('server bound on %s', self.gameSocketAddress);
			});
			console.log("teste");
			self.gameProcess = spawn('./emulator/snes9x' ,[id, 'emulator/Street-Fighter-II-The-World-Warrior-USA.sfc']);
			self.gameProcess.stdout.on('data', function (data) {
		  		//console.log(id + " :: Emulator :: " + data);
			});

			self.gameProcess.stdout.on('error', function (err) {
				console.log("Error: " + err);
			});

			self.currentExperiment = new Experiment(connection);
			// self.currentExperiment.initializeExperiment(7, 5, connection);

			self.browserSocket.emit('startLoop');
		});
	};

	this.splitGameMessage = function (dataList) {
		var returnList = [];
		if (dataList.length == 0) {return returnList}
		if (dataList.length == 1) {
			self.chunk += dataList[0];
			return returnList;
		}

		returnList.push(self.chunk + dataList[0]);

		for (var i = 1; i < dataList.length - 1; i++) {
			// console.log(':: Size :: Server :: ' + dataList[i].length);
			returnList.push(dataList[i]);
		}

		self.chunk += dataList[dataList.length - 1]
		return returnList;
	};

	this.connectSockets = function () {
		self.browserSocket.on('command', function (data) {
			// console.log(':: ' + id + ' :: Browser :: ' + data);

			if (self.currentImage) {
				self.currentExperiment.insertSample(data.split('|')[1], self.currentImage, connection);
			}

			self.gameSocket.write(data);
		});

		self.gameSocket.on('data', function (data) {
			var dataStr = data.toString();

			if (dataStr.indexOf('GameOver|')) {
				self.currentExperiment.setExperimentAsFinished(connection)
			}

			self.currentImage = dataStr;
			if (self.browserSocket) {
				self.browserSocket.send(dataStr);
			} else {
				self.disconnectGame();
			}
		});
	}

	io.of('/' + id).on('connection', function (socket) {
		console.log(id + ' conectado.');
		self.browserSocket = socket;

		self.browserSocket.on('disconnect', function () {
			console.log(':: ' + id + ' :: Browser :: Browser Disconnected');
			self.disconnectGame();
		});

		self.browserSocket.on('stopExperiment', function (data) {
			console.log(':: ' + id + ' :: Browser :: Stopping Experiment');
			self.disconnectGame();
		});

		self.browserSocket.on('startExperiment', function (data) {
			console.log(':: ' + id + ' :: Browser :: Starting Experiment');
			self.startExperiment();
		});

		if (self.gameSocket) {
			self.connectSockets();
		}
	});
};

module.exports = instance;
