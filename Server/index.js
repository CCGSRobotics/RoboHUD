const { spawn } = require('child_process');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
let client = "";

const commands = {
  'Driving': [
    'python3',
    ['-u', './Driving/server.py']
  ]
}

let children = {};

function addListeners(index) {
  children[index].stdout.on('data', (data) => {
    console.log(`${index} stdout: ${data}`);
    server.send(`${index} stdout: ${data}`, 5002, client);
  });

  children[index].stderr.on('data', (data) => {
    console.error(`${index} stderr: ${data}`);
    server.send(`${index} stderr: ${data}`, 5002, client);
  });

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
  }
});

server.bind(5000);