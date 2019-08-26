const { sendData, Dynamixel } = require('./JS/main.js');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

function createModifier(name, id, data) {
  if (data['Access'].includes('W')) {
    const input = document.createElement('input');

    input.type = 'number';
    input.value = data['InitialValue'];
    input.addEventListener('change', function(event) {
      sendData(`(modify)-${id}-${name}-${event.target.value}`);
    })
    
    if (data.hasOwnProperty('Min')) {
      input.min = data['Min'];
    }
    if (data.hasOwnProperty('Max')) {
      input.max = data['Max'];
    }

    return input;
  }

  return null;
}

function createRow(items, colTag) {
  let parent = document.createElement('tr');

  let item;
  for (let col = 0; col < items.length; col++) {
    item = document.createElement(colTag);
    item.innerHTML = items[col];
    parent.appendChild(item);
  }

  return parent;
}

function createTable(servo) {
  const csv = servo.controlTableFile;
  
  let table = document.getElementById('control_table');
  let headings = csv[0].split(', ');
  headings.push('Current Value');
  headings.push('Modify');

  table.appendChild(createRow(headings, 'th'));

  for (let line = 1; line < csv.length; line++) {
    let row = createRow(csv[line].split(', '), 'td');
    
    const name = csv[line].split(', ')[2]
    const data = servo.controlTable[name];

    const value = document.createElement('td');
    value.innerHTML = data['InitialValue'];
    value.id = `${name} Value`;
    row.appendChild(value);

    const modifier = createModifier(name, servo.id, data);
    if (modifier !== null) {
      row.appendChild(modifier);
    }

    table.appendChild(row);
  }
}

function initialiseTable(servo) {
  sendData(`(init)-${servo.model}-${servo.id}-${servo.protocol}`)
  createTable(servo);

  server.on('message', (msg, rinfo) => {
    const data = msg.toString().split(':');
    const name = data[0];
    const value = data[1];

    // console.log(name, value)
    const element = document.getElementById(`${name} Value`);
    if (element == null || element == undefined) {
      console.log(name)
    }
    element.innerHTML = value;
  });

  server.bind(5003);

  setInterval(function() {
    sendData(`(read)-${servo.id}-Present Position`);
  }, 100)
}