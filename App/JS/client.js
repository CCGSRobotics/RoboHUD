var net = require('net')
var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  delete controllers[gamepad.index];
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
  setInterval(scangamepads, 500);
}

var output = ""
output += "02-"
output += Math.round(1024 * val * 10).toString()
var client = new net.Socket();
client.connect(9999, '192.168.100.1', function() {
	console.log('Connection established!')
	console.log('Moving forward...')
	if (output.length < 7) {
		for (i = 0; output.length + i < 8; i++) {
		output += "0"
		}
	}
	client.write(output)
	setTimeout(function() {
	console.log('Stopping...')
	client.write('02-0000');
	}, 50);
});
