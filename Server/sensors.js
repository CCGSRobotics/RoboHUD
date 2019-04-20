const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf-8');

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

var PORT = 6789;
var HOST = '127.0.0.1';

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(decoder.end(Buffer.from(message)));
});

server.bind(PORT, HOST);