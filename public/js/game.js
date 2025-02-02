var Game = function (settings) {
	var self = this;
	this.keyboard = new THREEx.KeyboardState();
	this.settings = settings;
	this.waitingResponse = false;
	this.isExperimentOn = false;
	this.closeGame = false;

	this.lastLoop = 0;
	this.lastImage = 0;

	this.commands = {
		start: false,
		select: false,

		up: false,
		down: false,
		left: false,
		right: false,

		a: false,
		b: false,
		x: false,
		y: false
	};

	this.realFps = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

	this.drawScreen = function (baseStr) {
		var img = document.getElementById('image');
		img.src = "data:image/png;base64," + baseStr;
	};

	this.mainloop = function () {
		if (!self.isExperimentOn) {return;}

		var commandObj = { 
			action: 'Command',
			command: ''
		};
		commandObj.command += ((self.keyboard.pressed(settings.Up)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.Right)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.Down)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.Left)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.A)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.B)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.X)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.Y)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.L)) ? 1 : 0);
		commandObj.command += ((self.keyboard.pressed(settings.R)) ? 1 : 0);

		socket.send(JSON.stringify(commandObj));

		//continue looping
		var tbl = 1000/settings.MaxFPS;
		var time = new Date();
		var delta = (time - self.lastLoop);
		var waitTime = (tbl - delta > 0) ? (tbl - delta) : 0;

		// self.realFps.push(1000/(delta + time));
		// self.realFps.shift();
		// self.lastLoop = time;

		setTimeout(function() {
			self.mainloop();
		}, waitTime);
		//requestAnimationFrame(loop);
	};
}