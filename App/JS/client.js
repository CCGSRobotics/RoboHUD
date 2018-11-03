
var net = require('net')
var client = new net.Socket()

function terminateConnection(connection) {
	connection.write("01-0000")
	connection.write("02-0000")
	connection.write("03-0000")
	connection.write("04-0000")


function axisValue(dynamixel, axis) {
	var gamepad = navigator.getGamepads()[0]
	var val = Math.round((gamepad.axes[axis]+1) * 512)
	//if (dynamixel == 1 || dynamixel == 3) {
	//	val -= 1024
	//}
	var out = ""
	if (val < 10) {
		out += "000"
		out += val
	} else if (val < 100) {
		out += "00"
		out += val
	} else if (val < 1000) {
		out += "0"
		out += val
	} else {
		out += val
	}
	return out
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function pollGamepad(interval) {
  while (true) {
    client.write('01-' + axisValue(1, 3))
    await sleep(interval)
    client.write('02-' + axisValue(2, 1))
    await sleep(interval)
    client.write('03-' + axisValue(3, 3))
    await sleep(interval)
    client.write('04-' + axisValue(4, 1))
}
client.connect(9999, '192.168.100.1', function() {
  window.addEventListener("gamepadconnected", function(event) {
    pollGamepad(100)
  })
})

// client.on('close', function(){
// 	console.warn("Client terminated connection!")
// })
// client.on('end', function(){
// 	console.warn("Server terminated connection!")
// })
// client.on('error', function(){
// 	console.warn("Connection to server terminated unexpectedly!")
// })
