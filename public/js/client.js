var game;
var settings;
var GUI;

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function connect(actions, id) {
	var uri = "ws://" + document.location.host + "/browser/";
	socket = new WebSocket(uri);
	socket.onopen = function (event) {
		console.log("opened connection to " + uri);
	};
	socket.onmessage = function (event) {
		var obj = JSON.parse(event.data);
        if (actions[obj.action]) {
            actions[obj.action](obj);
        }
	};
	socket.onerror = function (event) {
		console.log("error: " + event.data);
	};

	document.getElementById("start-experiment").addEventListener("click", function () {
		var start = { action: 'Start' };
		game.closeGame = false;
		socket.send(JSON.stringify(start));
	});

	document.getElementById("stop-experiment").addEventListener("click", function () {
		var stop = { action: 'Stop'}
		socket.send(JSON.stringify(stop));
		game.isExperimentOn = false;
	});
}

window.onload = function () {
	settings = new Settings();
	GUI = new dat.GUI();
	settings.configureGUI(GUI);

	game = new Game(settings);

	var actions = {};

	actions["Game"] = function (obj) {
		var image = obj.image;
		game.drawScreen(image);
		if (!game.isExperimentOn && !game.closeGame) {
			game.isExperimentOn = true;
			game.mainloop();
		}
		var time = new Date();
		game.realFps.push(1000/(time - game.lastLoop));
		game.realFps.shift();
		game.lastLoop = time;
	}

	actions["GameOver"] = function (message) {
		game.isExperimentOn = false;
		game.closeGame = true;
	}

	actions["Error"] = function (obj) {
		var err = obj.message;
		var error = document.getElementById('error');
		error.innerHTML = err;
	}

	//addGameSelect();
	connect(actions);
};
