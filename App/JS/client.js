var net = require('net');
var client = new net.Socket();
//var gamepads = require("html5-gamepad");
console.log('this actually runs');
//client.connect(9999, '192.168.100.1', function() {
	//var controller = gamepads[0];
	//setInterval(function() {
	window.addEventListener("gamepadconnected", function(event) {
		setInterval(function() {
			var gamepads = navigator.getGamepads()[event.gamepad.index];
			//console.log(event.gamepad.buttons[0])
			console.log(gamepads);
			//var controller = gamepads[0];
			//console.log(controller.axis("left trigger"));
			//console.log(controller)
		}, 1000);
	});
	//}, 50)
//});
