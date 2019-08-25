const { sendData, Dynamixel } = require('./JS/main.js');

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
    item.style.border = '1px solid black';
    item.innerHTML = items[col];
    parent.appendChild(item);
  }

  return parent;
}

function createTable(servo) {
  const csv = servo.controlTableFile;

  let table = document.getElementById('control_table');
  table.style.border = '1px solid black';
  table.style.borderCollapse = 'collapse';
  let header = document.createElement('tr');
  let headings = csv[0].split(', ');

  table.appendChild(createRow(headings, 'th'));

  for (let line = 1; line < csv.length; line++) {
    let row = createRow(csv[line].split(', '), 'td');

    const name = csv[line].split(', ')[2]
    const data = servo.controlTable[name];
    const modifier = createModifier(name, servo.id, data);
    if (modifier !== null) {
      row.appendChild(modifier);
    }

    table.appendChild(row);
  }
}
