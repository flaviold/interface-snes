function connect() {
	var uri = "ws://" + window.location.host + "/browser/" + id;
	socket = new WebSocket(uri);
	socket.onopen = function (event) {
		console.log("opened connection to " + uri);
		socket.send('RegisterSocket|User\n');
	};
	socket.onmessage = function (event) {
		console.log(event.data);
	};
	socket.onerror = function (event) {
		console.log("error: " + event.data);
	};
}

window.onload = function () {
    connect();
};