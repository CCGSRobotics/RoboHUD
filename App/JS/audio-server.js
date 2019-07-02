// const { Peer } = require('peerjs');
const server = new Peer('server', {host: 'localhost', port: 9000, path: '/robotics'});
server.on('connection', (conn) => {
  conn.on('data', (data) => {
    // Will print 'hi!'
    console.log(data);
  });
});
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
server.on('call', (call) => {
  navigator.getUserMedia({video: false, audio: true}, (stream) => {
    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', (remoteStream) => {
      // Show stream in some <video> element.
    });
  }, (err) => {
    console.error('Failed to get local stream', err);
  });
});