var io = io.connect(document.location.origin + '/' + id);
var game;
var settings;
var GUI;

io.on('connect', function () {
	console.log("conectado.");
});

function setButtonsEvents() {
	//start experiment button
	$('#start-experiment').click(function () {
		io.emit('startExperiment');
		game.isExperimentOn = true;
	});

	$('#stop-experiment').click(function () {
		io.emit('stopExperiment');
		game.isExperimentOn = false;
	});
};

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

	game = new Game(settings, io);

	setButtonsEvents();

	io.on('message', function (data) {
		var baseStr = data.toString();
		var image = new Image();
		image.src = "data:image/png;base64," + baseStr;
		ctx.drawImage(image, 0, 0, 512, 448);
	});

	io.on('startLoop', function () {
		console.log('starting loop');
		game.mainloop();
	});
}
