const io = require('../../lib/io');
const robotPath = 'Robots';

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
  const dir = io.readConfDirSync(path);

  for (let i = 0; i < dir.length; ++i) {
    if (!files.includes[dir[i]]) {
      files.push(dir[i]);
    }
  }

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
  const servos = readDir('Servos');

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
function removeGroup(index, group) {
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
 * Checks to see if the group should be appended
 * @param {Array} groups The groups already present in the row
 * @param {Number} index The index of the row in the table (1-indexed)
 * @param {Node} active The active element
 */
function appendKey(groups, index, active) {
  const id = active.id;
  const value = active.value;
  if (!groups.includes(value) && value !== '') {
    new Promise((resolve, reject) => {
      createSingleGroup(index, value);
      resolve();
    }).then(() => {
      document.getElementById(id).value = '';
    });
  }
}

/**
 * Checks to see if the group should be deleted
 * @param {Object} event The keydown event
 * @param {Node} active The  active element
 * @param {Number} index The index of the row in the table (1-indexed)
 */
function deleteKey(event, active, index) {
  const groups = getGroups(index);
  if (groups.length > 0) {
    if (active.value == '' || event.ctrlKey) {
      event.preventDefault();
      const last = groups[groups.length - 1];

      new Promise((resolve, reject) => {
        removeGroup(index, last);
        resolve();
      }).then(() => {
        active.value = last;
      });
    }
  }
}

/**
 * Adds a new group if there is not one already
 * @param {Object} event The keydown event
 */
function callKey(event) {
  const active = document.activeElement;
  const [type, index] = active.id.split('-');
  if (active.nodeName == 'INPUT' && active.type == 'text' &&
  type == 'groupinput') {
    const groups = getGroups(index);
    if ([',', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
      appendKey(groups, index, active);
    } else if (event.key == 'Backspace') {
      deleteKey(event, active, index);
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
 * @param {Array} range The min & max to set to
 */
function setRangeValues(index, range) {
  const [min, max] = range;
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
 * Selects an option based on a comparison to defaul values
 * @param {Any} value The value to compare to default
 * @param {Any} defaultValue The default value
 * @param {String} defaultId The id to use if value matches defaultValue
 * @param {String} otherId The id to use if the value & default are different
 */
function selectOption(value, defaultValue, defaultId, otherId) {
  if (value == defaultValue) {
    document.getElementById(defaultId).checked = true;
  } else {
    document.getElementById(otherId).checked = true;
  }
}

/**
 *
 * @param {Number} index The index of the row in the table
 * @param {Array} groups All the groups to add
 */
function addGroups(index, groups) {
  for (let i = 0; i < groups.length; ++i) {
    if (!getGroups(index).includes(groups[i])) {
      createSingleGroup(index, groups[i]);
    }
  }
}

/**
 * Updates the necessary inputs for a given option
 * @param {String} key The key of the item to modify
 * @param {Object} options The object containing all options
 * @param {Number} index The index of the row in the table (1-indexed)
 */
function handleOption(key, options, index) {
  switch (key) {
    case 'id':
      document.getElementById(`id-${index}`).value = options.id;
      break;
    case 'model':
      document.getElementById(`model-${index}`).value = options.model;
      break;
    case 'protocol':
      const protocol = options.protocol;
      selectOption(protocol, 1, `protocol1-${index}`, `protocol2-${index}`);
      break;
    case 'mode':
      selectOption(options.mode, 'wheel', `wheel-${index}`, `joint-${index}`);
      break;
    case 'range':
      setRangeValues(index, options.range);
      break;
    case 'groups':
      addGroups(index, options.groups);
      break;
    default:
      console.warn(`Invalid option: ${key}`);
      break;
  }
}

/**
 * Updates a row with the given parameters
 * @param {Number} index
 * @param {Object} options The options to update to
 */
function updateRow(index, options) {
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      handleOption(key, options, index);
    }
  }
}

/**
 * Adds onchange listeners to items that require them
 * @param {Number} index The index of the row in the table (1-indexed)
 */
function addListeners(index) {
  document.getElementById(`joint-${index}`).onchange = function() {
    setRangeValues(index, [0, 1024]);
  };

  document.getElementById(`wheel-${index}`).onchange = function() {
    setRangeValues(index, [0, 0]);
  };

  document.getElementById(`min-${index}`).onchange = function() {
    onValueChange(index);
  };

  document.getElementById(`max-${index}`).onchange = function() {
    onValueChange(index);
  };
}

/**
 * Creates options based on the values of previous rows
 * @param {Number} index The index of the row in the table
 * @return {Object} The options created
 */
function createOptions(index) {
  const options = {
    protocol: 1,
    mode: 'joint',
    model: null,
  };

  const dir = readDir('Servos/');
  if (dir !== null && dir.length > 0) {
    options.model = dir[0].split('.')[0];
  }

  if (index > 1) {
    options.protocol =
      document.getElementById(`protocol1-${index - 1}`).checked? 1 : 2;
    options.mode =
      document.getElementById(`wheel-${index - 1}`).checked? 'wheel' : 'joint';
    options.model = document.getElementById(`model-${index - 1}`).value;
    options.groups = getGroups(index);
  }

  return options;
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

  updateRow(index, createOptions(index));
  addListeners(index);
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
    const id = parseInt(document.getElementById(`id-${i}`).value);
    servos[id] = {
      model: document.getElementById(`model-${i}`).value,
      id: id,
      protocol: document.getElementById(`protocol1-${i}`).checked? 1 : 2,
      minPos: parseInt(document.getElementById(`min-${i}`).value),
      maxPos: parseInt(document.getElementById(`max-${i}`).value),
      mode: document.getElementById(`wheel-${i}`).checked? 'wheel' : 'joint',
      groups: getGroups(i),
    };
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

  io.writeConf(`Robots/${name}.json`, config).then(() => {
    console.log(`Saved the file as ${name}.json`);
    const select = document.getElementById('robot-select');
    select.removeChild(select.lastChild);
    select.appendChild(createOption(name));
    select.appendChild(createOption(''));
    select.value = name;
    loadRobot(name);
  }).catch(() => {
    console.error('Failed to write robot configuration');
  });
}

/**
 * Handles the error status of functions
 * @param {String} err The error message output by the function
 * @param {String} errorMessage The error message to output
 * @param {String} successMessage The success message to output
 */
function handleError(err, errorMessage, successMessage) {
  if (err) {
    console.error(errorMessage);
  } else {
    console.log(successMessage);
  }
}

/**
 * Deletes the selected robot
 */
function deleteRobot() { // eslint-disable-line no-unused-vars
  const parent = document.getElementById('robot-select');
  const name = parent.value;

  io.removeConf(`Robots/${name}.json`)

  for (let i = 0; i < parent.length; ++i) {
    if (parent.options[i].value == name) {
      parent.remove(i);
      break;
    }
  }

  loadRobot('');
}

/**
 * Removes all rows in the table, except the header
 * @param {Boolean} newRow Whether or not to add a new row
 * @return {Promise} A promise that is resolved when all rows are removed
 */
function removeAllRows(newRow) {
  const children = document.getElementById('parent').childElementCount;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < children; ++i) {
      removeLastRow(1);
    }

    if (newRow) {
      addRow();
    }
    resolve();
  });
}

/**
 * Switches the visibility of the robot name input & delete button
 * @param {String} nameDisplay The display setting for the name input
 * @param {String} deleteDisplay The display setting for the delete button
 */
function switchInputVisibility(nameDisplay, deleteDisplay) {
  document.getElementById('name').style.display = nameDisplay;
  document.getElementById('delete').style.display = deleteDisplay;
}
/**
 * Loads a robot for the user to edit
 * @param {String} name The name of the robot
 */
function loadRobot(name) {
  document.getElementById('name').value = '';
  document.getElementById('robot-select').value = name;
  if (name == '') {
    removeAllRows(true);
    switchInputVisibility('inline', 'none');
  } else {
    switchInputVisibility('none', 'inline');
    removeAllRows(false).then(() => {
      io.readConf(`Robots/${name}.json`).then((data) => {
        const robot = JSON.parse(data);
        let i = 0;
        for (const index in robot) {
          if (robot.hasOwnProperty(index)) {
            const config = robot[index];
            config.range = [config.minPos, config.maxPos];
            delete config.minPos;
            delete config.maxPos;
            addRow();
            updateRow(++i, config);
          }
        }
      }).catch(() => {
        console.error('Failed to read robot configuration');
      });
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
const robots = readDir(robotPath);

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
