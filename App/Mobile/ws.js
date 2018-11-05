var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510})

var net = require('net');
var client = new net.Socket();
var usercount = 0

client.connect(9999, '127.0.0.1', function() {
  wss.on('connection', function (ws) {
    ws.on('message', function (message) {
      client.write(message);
    });
  });
})
