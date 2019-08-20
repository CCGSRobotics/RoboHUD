const fs = require('fs');
const net = require('net');
const server = net.createServer();

server.on('connection', function(socket) {
  socket.on('data', function(data) {
    let fileData = data.toString().split('\n');
    const filename = fileData[0].replace('-', '');
    fileData.shift();
    fileData = fileData.join('\n');

    fs.writeFile(`./Driving/Servos/${filename}.csv`, fileData, function(err) {
      if (err) {
        console.error('Failed to write file! Do you have access?');
      }
      console.log(`Saved the file as ${filename}.csv`);
    });
  });
});

server.listen(5004, '');
