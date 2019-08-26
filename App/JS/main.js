const dgram = require('dgram');
const socket = new dgram.createSocket('udp4');
const fs = require('fs');

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

/**
 * A class representing a single Dynamixel servo
 */
class Dynamixel {
  /**
   *
   * @param {String} model The model name of the Dynamixel
   * @param {Number} id The ID of the Dynamixel
   * @param {Number} protocol The protocol used, either 1 or 2
   */
  constructor(model, id, protocol) {
    this.model = model;
    this.id = id;
    this.protocol = protocol;

    const path = `./App/JS/Resources/Servos/${model}.csv`;
    fs.readFile(path, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error(`The file at path ${path} does not exist!`);
          return;
        }

        throw err;
      }

      this.controlTable = {};

      const fileData = data.toString().split('\n').filter(function(element) {
        return element !== '';
      });
      this.controlTableFile = fileData;
      const headings = fileData[0].split(', ');

      for (let line = 1; line < fileData.length; line++) {
        const columns = fileData[line].split(', ');
        const index = columns[2];
        this.controlTable[index] = {};

        for (let col = 0; col < columns.length; col++) {
          if (col !== 2) {
            this.controlTable[index][headings[col]] = columns[col];
          }
        }
      }
    });
  }
}

module.exports.sendData = sendData;
module.exports.Dynamixel = Dynamixel;
