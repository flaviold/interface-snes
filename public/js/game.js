var Game = function (settings, width, height) {
	var self = this;
	this.keyboard = new THREEx.KeyboardState();
	this.settings = settings;
	this.waitingResponse = false;
	this.isExperimentOn = false;

	this.lastLoop = 0;

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

	this.showFPS = function (ctx) {
		var sum = 0,
		avg;

		for (var i = 0; i < this.realFps.length; i++) {
			sum += this.realFps[i];
		}

		avg = sum/this.realFps.length;
		ctx.fillStyle = "#FF0000";
		ctx.fillText(avg.toFixed(2), 0, 15);
	};

	this.drawScreen = function (ctx, baseStr) {
		var image = new Image();
		image.src = "data:image/png;base64," + baseStr;
		ctx.drawImage(image, 0, 0, width, height);
		this.showFPS(ctx);
	};

	this.mainloop = function () {
		if (!self.isExperimentOn) {return;}

		var commandObj = { 
			action: 'Command',
			command: ''
		};
		commandObj.command += ((this.keyboard.pressed(settings.Up)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.Right)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.Down)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.Left)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.A)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.B)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.X)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.Y)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.L)) ? 1 : 0);
		commandObj.command += ((this.keyboard.pressed(settings.R)) ? 1 : 0);

		socket.send(JSON.stringify(commandObj));

		//continue looping
		var tbl = 1000/settings.MaxFPS;
		var time = new Date();
		var delta = (time - self.lastLoop);
		var waitTime = (tbl - delta > 0) ? (tbl - delta) : 0;

		this.realFps.push(1000/(time - this.lastLoop));
		this.realFps.shift();
		this.lastLoop = time;

		setTimeout(function() {
			self.mainloop();
		}, waitTime);
		//requestAnimationFrame(loop);
	};
}