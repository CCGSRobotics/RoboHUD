"use strict";

const http               = require('http');
const express            = require('express');
const RemoteTCPFeedRelay = require('./lib/remotetcpfeed');
const app                = express();

/**
* on the remote rpi run
* raspivid -t 0 -o - -w 1280 -h 720 -fps 25 | nc -k -l 5001
* to create a raw tcp h264 streamer
*/

  //public website
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor/dist'));

const server  = http.createServer(app);

const feed    = new RemoteTCPFeedRelay(server, {
  feed_ip   : "192.168.100.1",
  feed_port : 5002,
});


server.listen(8080);
console.log("Video server listening on port 8080")