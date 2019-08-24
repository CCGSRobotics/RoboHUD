const { sendData, Dynamixel } = require('./JS/main.js');

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
    table.appendChild(createRow(csv[line].split(', '), 'td'));
  }
}
