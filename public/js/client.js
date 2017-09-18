var game;
var settings;
var GUI;

function connect(actions) {
	var uri = "ws://" + window.location.host + "/browser/" + id;
	socket = new WebSocket(uri);
	socket.onopen = function (event) {
		console.log("opened connection to " + uri);
	};
	socket.onmessage = function (event) {
		var message = event.data;
		var action = message.split('|')[0];
        if (actions[action]) {
            actions[action](message);
        }
	};
	socket.onerror = function (event) {
		console.log("error: " + event.data);
	};

	document.getElementById("start-experiment").addEventListener("click", function () {
		socket.send('Start|\n');
	});

	document.getElementById("stop-experiment").addEventListener("click", function () {
		socket.send('Stop|\n');
		game.isExperimentOn = false;
	});
}

window.onload = function () {
	canvas = document.getElementById('viewport');
	canvas.width = 512;
	canvas.height = 448;
	ctx = canvas.getContext('2d');
	ctx.fillStyle = "white";
	ctx.font = "bold 16px Arial";

	settings = new Settings();
	GUI = new dat.GUI();
	settings.configureGUI(GUI);

	game = new Game(settings, canvas.width, canvas.height);

	var actions = {};

	actions["Image"] = function (message) {
		var image = message.split('|')[1];
		game.drawScreen(ctx, image);
		if (!game.isExperimentOn) {
			game.isExperimentOn = true;
			game.mainloop();
		}
	}

	actions["GameOver"] = function (message) {
		game.isExperimentOn = false;
		console.log(message);
	}

	connect(actions);
};