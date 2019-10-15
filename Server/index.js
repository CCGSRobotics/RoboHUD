const {spawn} = require('child_process');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
let client = '';

const commands = {
  'Driving': [
    'python3',
    ['-u', './Driving/server.py'],
  ],
  'Fileserver': [
    'node',
    ['./fileServer.js'],
  ],
};

const children = {};

/**
 * Outputs the data from a given data stream
 * @param {String} data The data to output
 * @param {String} index The index of the command
 * @param {String} name The name of the output method
 */
function handleListeners(data, index, name) {
  console.log(`${index} ${name}: ${data}`);
  server.send(`${index} ${name}: ${data}`, 5002, client);
}

/**
 * Adds stdout and stderr listeners to a given command
 * @param {String} index The index of the command
 */
function addListeners(index) {
  const outputs = [children[index].stdout, children[index].stderr];
  for (let i = 0; i < outputs.length; i++) {
    outputs[i].on('data', (data) =>
      handleListeners(data, index, i == 0? 'stdout' : 'stderr'));
  }

  children[index].on('close', (code) => {
    console.log(`Process '${index}' exited with code ${code}`);
    server.send(`Process '${index}' exited with code ${code}`, 5002, client);
  });
}

server.on('listening', () => {
  console.log(`Server listening on port ${server.address().port}`);
});

server.on('message', (msg, rinfo) => {
  if (client !== rinfo.address) {
    console.log(`Switching saved IP from '${client}' to '${rinfo.address}'`);
    client = rinfo.address;
  }
  if (commands.hasOwnProperty(msg)) {
    children[msg] = spawn(commands[msg][0], commands[msg][1]);
    addListeners(msg);
    console.log(`Started function: ${msg}`);
  }
});

server.bind(5000);
