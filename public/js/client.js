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
	var uri = "ws://200.137.66.3:8000/browser/";
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
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
}

// function addGameSelect() {
// 	var p1Element = document.getElementById('p1-sel');
// 	var p2Element = document.getElementById('p2-sel');
// 	var lvlElement = document.getElementById('lvl-sel');

// 	p1Element.onchange = function (event) {
// 		p1 = event.target.value;
// 		p2Element.innerHTML = '<option value="">-</option>'
// 		if (p1) {
// 			for (var i = 0; i < charactersList.length; i++) {
// 				if (i == p1) {
// 					continue;
// 				}
// 				var option = document.createElement('option');
// 				option.value = i;
// 				option.innerHTML = charactersList[i];
// 				p2Element.append(option);
// 			}
// 		}
// 	}
// 	p2Element.onchange = function (event) {
// 		p2 = event.target.value;
// 	}
// 	lvlElement.onchange = function (event) {
// 		lvl = event.target.value;
// 	}
// }

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

	actions["Game"] = function (obj) {
		var image = obj.image;
		game.drawScreen(ctx, image);
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
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	actions["Error"] = function (obj) {
		var err = obj.message;
		var error = document.getElementById('error');
		error.innerHTML = err;
	}

	//addGameSelect();
	connect(actions);
};