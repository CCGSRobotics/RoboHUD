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

      sendData(`(init)-${model}-${id}-${protocol}`);
      this.mode = 'joint';
    });
  }

  /**
   * Sets the dynamixel to the specified mode
   * @param {String} mode The mode to set to, either wheel or joint
   */
  setMode(mode) {
    sendData(`(mode)-${this.id}-${mode}`);
    this.mode = mode;
  }

  /**
   * Moves the servo to the specified position at a certain speed.
   *  If the servo is a wheel, position is ignored and the servo
   *   moves at the specified speed
   * @param {Number} percentage The percentage of maximum speed
   * @param {Number} position The target position of the servo
   */
  move(percentage = 0, position = 9999) {
    let value = 1023;

    if (percentage < 0) {
      value *= -1 * (percentage / 100);
      value += 1024;
    } else {
      value *= (percentage / 100);
    }

    value = Math.round(value);

    if (this.mode == 'joint') {
      sendData(`${this.id}-${position}-${value}`);
    } else {
      sendData(`${this.id}-${value}`);
    }
  }
}

module.exports.sendData = sendData;
module.exports.Dynamixel = Dynamixel;
