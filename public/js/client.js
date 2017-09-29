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
var p1, p2, lvl;

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
		var error = document.getElementById('error');
		var resultElement = document.getElementById('result');
		if (!p1 || !p2 || !lvl) {
			error.innerHTML = "selecione as opções antes de iniciar o experimento";
			return;
		}
		error.innerHTML = "";
		resultElement.className = "hidden";
		socket.send('Start|'+p1+''+p2+''+lvl+'\n');
	});

	document.getElementById("stop-experiment").addEventListener("click", function () {
		socket.send('Stop|\n');
		game.isExperimentOn = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
}

function addGameSelect() {
	var p1Element = document.getElementById('p1-sel');
	var p2Element = document.getElementById('p2-sel');
	var lvlElement = document.getElementById('lvl-sel');

	p1Element.onchange = function (event) {
		p1 = event.target.value;
		p2Element.innerHTML = '<option value="">-</option>'
		if (p1) {
			for (var i = 0; i < charactersList.length; i++) {
				if (i == p1) {
					continue;
				}
				var option = document.createElement('option');
				option.value = i;
				option.innerHTML = charactersList[i];
				p2Element.append(option);
			}
		}
	}
	p2Element.onchange = function (event) {
		p2 = event.target.value;
	}
	lvlElement.onchange = function (event) {
		lvl = event.target.value;
	}
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
		
		resultElement.className = 'text-center';
	}

	actions["Error"] = function (message) {
		var err = message.split('|')[1];
		var error = document.getElementById('error');
		if (err == 'maxGames') {
			error.innerHTML = "O servidor está no limite de usuários jogando,<br>tente novamente mais tarde."
		}
	}

	addGameSelect();
	connect(actions);
};