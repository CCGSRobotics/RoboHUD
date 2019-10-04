const fs = require('fs');

/**
 * Creates a number input inside a <td>
 * @param {String} id The ID of the input element
 * @param {Number} min The minimum item in the range
 * @param {Number} max The maximum item in the range
 * @param {Number} value The initial value of the range
 * @return {Node} A <td> element containing the <range> element
 */
function createRange(id, min, max, value) {
  const parent = document.createElement('td');
  const range = document.createElement('input');
  range.setAttribute('type', 'number');
  range.setAttribute('id', id);
  range.setAttribute('min', min);
  range.setAttribute('max', max);
  range.setAttribute('value', value);

  parent.appendChild(range);
  return parent;
}

/**
 * Returns all of the files in the given path
 * @param {String} path The path to the directory
 * @return {Array} An array containing all of the files
 */
function readDir(path) {
  const files = [];
  fs.readdirSync(path).forEach((file) => {
    if (!files.includes(file)) {
      files.push(file);
    }
  });

  return files;
}

/**
 * Creates a select box inside a <td>, with an item for every downloaded servo
 * @param {Number} index The index of the row in the table (1-indexed)
 * @return {Node} A <td> element containing the <select> element
 */
function createModel(index) {
  const model = document.createElement('td');
  const select = document.createElement('select');
  select.setAttribute('id', `model-${index}`);
  const servos = readDir('./App/JS/Resources/Servos');

  for (let i = 0; i < servos.length; ++i) {
    const option = document.createElement('option');
    option.setAttribute('value', servos[i].split('.')[0]);
    option.innerHTML = servos[i].split('.')[0];

    select.appendChild(option);
  }

  model.appendChild(select);
  return model;
}

/**
 * Creates a <td> item with a radio button for every item in the array
 * @param {String} name The "name" group the options are assigned to
 * @param {Array} ids An array of IDs, one element for each radio button
 * @param {Array} values An array of values, one element for each radio button
 * @return {Node} A <td> element containing the radio buttons
 */
function createRadios(name, ids, values) {
  const parent = document.createElement('td');
  parent.setAttribute('id', name);
  for (let i = 0; i < ids.length; ++i) {
    const item = document.createElement('input');
    item.setAttribute('type', 'radio');
    item.setAttribute('id', ids[i]);
    item.setAttribute('value', values[i]);
    item.setAttribute('name', name);

    const label = document.createElement('label');
    label.setAttribute('for', ids[i]);
    label.innerHTML = values[i];

    parent.appendChild(item);
    parent.appendChild(label);
  }

  return parent;
}

/**
 * Returns the list of groups for a servo at the specified index
 * @param {Number} index The index of the row
 * @return {Array} The list of groups
 */
function getGroups(index) {
  const parent = document.getElementById(`groups-${index}`);
  const nodes = parent.childNodes;
  const groups = [];

  for (let i = 0; i < nodes.length - 1; ++i) {
    groups.push(nodes[i].id.split('-')[0]);
  }
  return groups;
}

/**
 * Removes a group in a specified row
 * @param {Number} index The index of the row
 * @param {String} group The group to remove
 */
function removeGroup(index, group) { // eslint-disable-line no-unused-vars
  document.getElementById(`${group}-${index}`).remove();
}

/**
 * Creates a group in a specified row
 * @param {Number} index The index of the row
 * @param {String} group The name of the group
 */
function createSingleGroup(index, group) {
  const parent = document.createElement('span');
  parent.class = group;
  parent.id = `${group}-${index}`;

  const label = document.createElement('label');
  label.innerHTML = group;
  parent.appendChild(label);

  const button = document.createElement('button');
  button.setAttribute('onclick', `removeGroup(${index}, "${group}")`);
  button.innerHTML = '✖';
  parent.appendChild(button);

  const td = document.getElementById(`groups-${index}`);
  td.insertBefore(parent, document.getElementById(`groupinput-${index}`));
}

/**
 * Adds a new group if there is not one already
 * @param {Object} event The keydown event
 */
function callKey(event) {
  const active = document.activeElement;
  if (active.nodeName == 'INPUT' && active.type == 'text') {
    const parts = active.id.split('-');
    const type = parts[0];
    const index = parts[1];

    if (type == 'groupinput') {
      const groups = getGroups(index);
      if (event.key == ',' || event.key == ' ' || event.key == 'Enter') {
        if (!groups.includes(active.value) && active.value != '') {
          createSingleGroup(index, active.value);
          setTimeout(function() {
            active.value = '';
          }, 1);
        }
      } else if (event.key == 'Backspace') {
        if (groups.length > 0) {
          if (active.value == '' || event.ctrlKey) {
            const last = groups[groups.length - 1];
            removeGroup(index, last);
            setTimeout(function() {
              active.value = last;
            }, 1);
          }
        }
      }
    }
  }
}

/**
 * Adds the callKey function as a keydown listener
 */
function focusGroup() { // eslint-disable-line no-unused-vars
  document.addEventListener('keydown', callKey);
}

/**
 * Removes the callKey function as a keydown listener
 */
function unfocusGroup() { // eslint-disable-line no-unused-vars
  document.removeEventListener('keydown', callKey);
}

/**
 * Creates a group input in the given row
 * @param {Number} index The index of the row in the table (1-indexed)
 * @return {Node} A <td> element containing an <input> element
 */
function createGroup(index) {
  const parent = document.createElement('td');
  parent.setAttribute('id', `groups-${index}`);
  const input = document.createElement('input');
  input.setAttribute('id', `groupinput-${index}`);
  input.setAttribute('onfocusin', 'focusGroup()');
  input.setAttribute('onfocusout', 'unfocusGroup()');

  parent.appendChild(input);
  return parent;
}

/**
 * Creates an array of <td> elements that represent a row in the table
 * @param {Number} index The index of the row in the table (1-indexed)
 * @return {Array} An array of Nodes, each being a <td> element
 */
function createElements(index) {
  const elements = [];
  elements.push(createRange(`id-${index}`, 1, 250, index));
  elements.push(createModel(index));
  const radios = createRadios(`protocol-${index}`, [`protocol1-${index}`,
    `protocol2-${index}`], [1, 2]);
  elements.push(radios);
  const modes = createRadios(`mode-${index}`, [`wheel-${index}`,
    `joint-${index}`], ['Wheel', 'Joint']);
  elements.push(modes);
  elements.push(createRange(`min-${index}`, 0, 1024, 0));
  elements.push(createRange(`max-${index}`, 0, 1024, 1024));
  elements.push(createGroup(index));

  return elements;
}

/**
 * Sets the values of the inputs in the min and max column
 * @param {Number} index The index of the row in the table (1-indexed)
 * @param {Number} min The new value of the input in the min column
 * @param {Number} max The new value of the input in the max column
 */
function setRangeValues(index, min, max) {
  document.getElementById(`min-${index}`).value = min;
  document.getElementById(`max-${index}`).value = max;
}

/**
 * Updates the mode selection based on the values of the min and max inputs
 * @param {Number} index The index of the row in the table (1-indexed)
 */
function onValueChange(index) {
  const min = document.getElementById(`min-${index}`);
  const max = document.getElementById(`max-${index}`);

  if (min.value == 0 && max.value == 0) {
    document.getElementById(`wheel-${index}`).checked = true;
  } else {
    document.getElementById(`joint-${index}`).checked = true;
  }
}

/**
 * Updates a row with the given parameters
 * @param {Number} index 
 * @param {Number} id 
 * @param {String} model 
 * @param {Number} protocol 
 * @param {String} mode 
 * @param {Number} min 
 * @param {Number} max 
 * @param {Array} groups 
 */
function updateRow(index, id, model, protocol, mode, min, max, groups) {
  document.getElementById(`id-${index}`).value = id;
  document.getElementById(`model-${index}`).value = model;
  
  if (protocol == 1) {
    document.getElementById(`protocol1-${index}`).checked = true;
  } else {
    document.getElementById(`protocol2-${index}`).checked = true;
  }

  if (mode == 'wheel') {
    document.getElementById(`wheel-${index}`).checked = true;
  } else {
    document.getElementById(`joint-${index}`).checked = true;
  }

  setRangeValues(index, min, max);

  for (let i = 0; i < groups.length; ++i) {
    createSingleGroup(index, groups[i]);
  }
}

/**
 * Adds a new row to the robot's servo table
 */
function addRow() {
  const parent = document.getElementById('parent');
  const row = document.createElement('tr');
  const index = parent.childElementCount;
  row.setAttribute('id', index);
  const children = createElements(index);

  for (let i = 0; i < children.length; ++i) {
    row.appendChild(children[i]);
  }

  parent.appendChild(row);
  
  let mode = 'joint';
  let protocol = 2;
  let model;
  let groups = [];

  if (index > 1) {
    model = document.getElementById(`model-${index - 1}`).value;

    if (document.getElementById(`protocol1-${index - 1}`).checked) {
      protocol = 1;
    }

    if (document.getElementById(`wheel-${index - 1}`).checked) {
      mode = 'wheel';
    }

    groups = getGroups(index);
  } else {
    protocol = 1;
    model = readDir('./App/JS/Resources/Servos/')[0].split('.')[0];
  }

  updateRow(index, index, model, protocol, mode, 0, 1024, groups);

  document.getElementById(`joint-${index}`).onchange = function() {
    setRangeValues(index, 0, 1024);
  };

  document.getElementById(`wheel-${index}`).onchange = function() {
    setRangeValues(index, 0, 0);
  };

  document.getElementById(`min-${index}`).onchange = function() {
    onValueChange(index);
  };

  document.getElementById(`max-${index}`).onchange = function() {
    onValueChange(index);
  };
}

/**
 * Removes the last row of the robot's servo table
 * @param {Number} minRows The minimum number of rows that must remain
 */
function removeLastRow(minRows) {
  const parent = document.getElementById('parent');
  if (parent.childElementCount > minRows) {
    parent.removeChild(parent.lastChild);
  }
}

/**
 * Resets the last row of robot's servo table
 */
function resetLastRow() { // eslint-disable-line no-unused-vars
  const parent = document.getElementById('parent');
  if (parent.childElementCount >= 2) {
    removeLastRow(1);
    addRow();
  }
}

/**
 * Creates a new robot from the user input
 * @return {Object} An object representing the configuration for each servo
 */
function createRobot() {
  const count = document.getElementById('parent').childElementCount;
  const servos = {};
  for (let i = 1; i < count; i++) {
    const model = document.getElementById(`model-${i}`).value;
    const id = parseInt(document.getElementById(`id-${i}`).value);
    let protocol = 1;

    if (document.getElementById(`protocol2-${i}`).checked) {
      protocol = 2;
    }

    const servo = {};
    servo.model = model;
    servo.id = id;
    servo.protocol = protocol;
    servo.minPos = parseInt(document.getElementById(`min-${i}`).value);
    servo.maxPos = parseInt(document.getElementById(`max-${i}`).value);

    if (document.getElementById(`wheel-${i}`).checked) {
      servo.mode = 'wheel';
    } else {
      servo.mode = 'joint';
    }
    servo.groups = getGroups(i);

    servos[id] = servo;
  }

  return servos;
}

/**
 * Saves the output of createRobot() to a JSON file
 */
function saveRobot() { // eslint-disable-line no-unused-vars
  const config = JSON.stringify(createRobot());
  let name = document.getElementById('robot-select').value;
  if (name == '') {
    name = document.getElementById('name').value;
  }

  fs.writeFile(`./App/JS/Resources/Robots/${name}.json`, config, function(err) {
    if (err) {
      console.error('Failed to write file! Do you have access?');
      console.error(err);
    } else {
      console.log(`Saved the file as ${name}.json`);
      const select = document.getElementById('robot-select');
      select.appendChild(createOption(name));
      select.value = name;
    }
  });
}

/**
 * Removes all rows in the table, except the header
 * @param {Boolean} newRow Whether or not to add a new row
 */
function removeAllRows(newRow) {
  const children = document.getElementById('parent').childElementCount;
  for (let i = 0; i < children; ++i) {
    setTimeout(() => {
      removeLastRow(1);
    }, 0.1);
  }

  if (newRow) {
    setTimeout(() => {
      addRow();
    }, children * 0.1 + 0.5);
  }
}

/**
 * Loads a robot for the user to edit
 * @param {String} name The name of the robot
 */
function loadRobot(name) {
  if (name == '') {
    removeAllRows(true);
    document.getElementById('name').style.visibility = 'visible';
  } else {
    removeAllRows(false);
    document.getElementById('name').style.visibility = 'hidden';
    fs.readFile(`App/JS/Resources/Robots/${name}.json`, (err, data) => {
      const robot = JSON.parse(data);
      let i = 0;
      for (const index in robot) {
        if (typeof(index) == 'number' || typeof(index) == 'string') {
          const servo = robot[index];
          addRow();
          updateRow(++i, index, servo.model, servo.protocol, servo.mode, servo.minPos, servo.maxPos, servo.groups);
        }
      }
    });
  }
}

/**
 * Creates an option for a <select> box
 * @param {String} value The value of the option element
 * @return {Node} An <option> element with the specified value
 */
function createOption(value) {
  const option = document.createElement('option');
  option.setAttribute('value', value);
  option.innerHTML = value;

  return option;
}

addRow();

const parent = document.getElementById('robot-select');
const robots = readDir('./App/JS/Resources/Robots');

for (let i = 0; i < robots.length; ++i) {
  const robot = robots[i].split('.')[0];
  parent.appendChild(createOption(robot));
}

parent.appendChild(createOption(''));

if (robots.length > 0) {
  const robot = robots[0].split('.')[0];
  parent.value = robot;
  loadRobot(robot);
}
parent.setAttribute('onchange', 'loadRobot(this.value)');
