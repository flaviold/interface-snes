var game;
var settings;
var GUI;
var charactersList = [
	"Ryu",
	"Honda",
	"Blanka",
	"Guile",
	"Ken",
	"Chun-Li",
	"Zangief",
	"Dhalsim"
];

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
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
}

function addGameInfo(p1, p2, lvl) {
	var p1Element = document.getElementById('p1');
	var p2Element = document.getElementById('p2');
	var lvlElement = document.getElementById('lvl');
	var infoElement = document.getElementById('info');

	p1Element.innerHTML = charactersList[p1];
	p2Element.innerHTML = charactersList[p2];
	lvlElement.innerHTML = lvl;

	infoElement.className = "text-center";
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
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var result = message.split('|')[1] 
		var resultElement = document.getElementById('result');

		if (result == 'P1') {
			resultElement.innerHTML = 'Vencedor: Player 1';
		} else if (result == 'P2') {
			resultElement.innerHTML = 'Vencedor: Bot';
		} else {
			resultElement.innerHTML = 'Empate';
		}
		
		console.log(message);
	}

	actions["Settings"] = function (message) {
		var settings = message.split('|')[1];
		player1 = parseInt(settings.substring(0, 1));
		player2 = parseInt(settings.substring(1, 2));
		level = parseInt(settings.substring(2, 3));

		addGameInfo(player1, player2, level);
	}

	connect(actions);
};