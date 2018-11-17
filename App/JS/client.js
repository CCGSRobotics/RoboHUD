var net = require('net');

function terminateConnection(connection) {
	connection.write("010");
	connection.write("020");
	connection.write("030");
	connection.write("040");
}

function axisValue(dynamixel, axis) {
	var gamepad = navigator.getGamepads()[0];
	var val = Math.round((gamepad.axes[axis]+1) * 512);

	if (val < 0 || val > 1024) {
		console.error("Controller value is out of bounds! (" + val + ")");
	}

	val = (val - 512) * -2;
	if (dynamixel == 1 || dynamixel == 3) {
		val = -val;
	}
	return val;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollGamepad(interval) {
	while (true) {
		clientSocket.write('02' + axisValue(1, 3));
		await sleep(interval);
		clientSocket.write('01' + axisValue(2, 1));
		await sleep(interval);
		clientSocket.write('04' + axisValue(3, 3));
		await sleep(interval);
		clientSocket.write('03' + axisValue(4, 1));
	}
}

module.Exports = { pollGamepad };
// client.on('close', function(){
// 	console.warn("Client terminated connection!")
// })
// client.on('end', function(){
// 	console.warn("Server terminated connection!")
// })
// client.on('error', function(){
// 	console.warn("Connection to server terminated unexpectedly!")
// })
