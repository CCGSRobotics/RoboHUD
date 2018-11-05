var net = require('net');
var client = new net.Socket();

function terminateConnection(connection) {
	connection.write("010000");
	connection.write("020000");
	connection.write("030000");
	connection.write("040000");
}

function axisValue(dynamixel, axis) {
	var gamepad = navigator.getGamepads()[0];
	var val = Math.round((gamepad.axes[axis]+1) * 512);

	if (val < 0 || val > 1024) {
		console.error("Controller value is out of bounds! (" + val + ")");
	}

	//Logic to make controller value proper
	if (val <= 512) {
		val = (val - 512) * -2;
	} else if (val < 512) {
		val <<= 1;
	}

	var out = "";
	if (val < 10) {
		out += "000";
		out += val;
	} else if (val < 100) {
		out += "00";
		out += val;
	} else if (val < 1000) {
		out += "0";
		out += val;
	} else {
		out += val;
	}

	return out;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollGamepad(interval) {
	while (true) {
		console.log(axisValue(2, 1));
		client.write('01-' + axisValue(1, 3));
		await sleep(interval);
		client.write('02' + axisValue(2, 1));
		await sleep(interval);
		client.write('03-' + axisValue(3, 3));
		await sleep(interval);
		client.write('04' + axisValue(4, 1));
	}
}

client.connect(9999, '192.168.100.1', function() {
	window.addEventListener("gamepadconnected", function(event) {
		pollGamepad(100);
	});
});

// client.on('close', function(){
// 	console.warn("Client terminated connection!")
// })
// client.on('end', function(){
// 	console.warn("Server terminated connection!")
// })
// client.on('error', function(){
// 	console.warn("Connection to server terminated unexpectedly!")
// })
