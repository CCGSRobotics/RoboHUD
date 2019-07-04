var PORT = 25565;
var HOST = '';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var dec = new TextDecoder();
var defaults = {
  "c": "carbon_dioxide"
}
var sensors = {
  "carbon_dioxide": {
    currentValue: 0
  }
}

server.on('listening', function() {
  var address = server.address();
   console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

server.on('message', function(message, remote) {
 // console.log(remote.address + ':' + remote.port +' - ' + message);
 message = dec.decode(message)
 var index = defaults[message[0]]
 var build = "";
 // We must remove the first item in the message that identifies the sensor
 for (var i = 1; i < message.length; i++) {
   build += message[i]
 }
 var value = parseInt(build)
 if (index == "carbon_dioxide") {
   // value = -1 * (value - 1023)
 }
 sensors[index].currentValue = value
 // document.getElementById(index).innerHTML = `${build} PPM`
});

server.bind(PORT, HOST);

setInterval(function() {
  clientSocket.send('GET', 25565, '192.168.100.1');
}, 100)
