var gameServer 	= require('./game_server');

gameServer.listen(function (port) {
	console.log('Server listening on port ' + port + '.');
});