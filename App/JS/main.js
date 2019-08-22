const dgram = require('dgram');
const socket = new dgram.createSocket('udp4');

// Note: this should be made part of the settings later
const defaultPort = 5001;
const defaultIP = '127.0.0.1';

socket.on('error', function(err) {
  console.error('UDP client error:\n' + err);
});

/**
 * Sends information over UDP to the specified IP and port
 * @param {String} data The data to send over UDP
 * @param {*} port The port number of the server
 * @param {*} ip The IP address of the server
 */
function sendData(data, port = defaultPort, ip = defaultIP) {
  if (data !== null && data !== undefined) {
    if (typeof(data) == 'string' && typeof(port) == 'number' &&
    typeof(ip) == 'string') {
      socket.send(data, port, ip);
    } else {
      console.error('Invalid argument types!');
    }
  } else {
    console.error('Data to send is invalid!');
  }
}

module.exports.sendData = sendData;
