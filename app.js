var gameServer 	= require('./game_server');

// global variables
(function () {
	currentGamesCount = 0;
})();

gameServer.listen(function (port) {
	console.log('Server listening on port ' + port + '.');
});