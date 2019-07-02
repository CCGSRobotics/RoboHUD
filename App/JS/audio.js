const peer = new Peer('client', {host: 'localhost', port: 9000, path: '/robotics'});
const conn = peer.connect('server');
conn.on('open', () => {
  conn.send('hi!');
});
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
navigator.getUserMedia({video: false, audio: true}, (stream) => {
  const call = peer.call('server', stream);
  call.on('stream', (remoteStream) => {
    // Show stream in some <video> element.
  });
}, (err) => {
  console.error('Failed to get local stream', err);
});