const http               = require('http');
const express            = require('express');
const RemoteTCPFeedRelay = require('./lib/remotetcpfeed');
const app                = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor/dist'));

const server  = http.createServer(app);

const feed    = new RemoteTCPFeedRelay(server, {
  feed_ip   : "192.168.100.1",
  feed_port : 8080,
});

server.listen(5001);
