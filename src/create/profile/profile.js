const {readConfDirSync, readConfSync} = require('../../lib/io');
const {createSelect, createGroupedSelect, createRadio,
  createTableHeaderText, createTableHeader, createTableData,
  createTableRow, createTable} =
  require('../../lib/html');
const controlTypes = ['Linear', 'Preset'];
const currentConf = {};
let previousMode = '';
let selectedNode = '';
let prevousPresetSelect = {
  node: '',
  item: '',
};

/**
 * Finds the robot configuration based on user selection
 * @return {Object} The parsed configuration
 */
function findRobotConf() {
  const filename = currentConf.robot;
  const conf = JSON.parse(readConfSync(`Robots/${filename}.json`));

  return conf;
}

/**
 * Finds all groups in a robot config
 * @return {Array} The groups found
 */
function findGroups() {
  const groups = [];
  const conf = findRobotConf();

  for (const servo in conf) {
    if (conf.hasOwnProperty(servo)) {
      const assignedGroups = conf[servo].groups;
      for (let i = 0; i < assignedGroups.length; ++i) {
        const group = assignedGroups[i];
        if (!groups.includes(group)) {
          groups.push(group);
        }
      }
    }
  }

  return groups;
}

/**
 * Creates an inline paragraph populated with the given text
 * @param {String} text The text to fill with
 * @return {Node} The created element
 */
function createInlineText(text) {
  const p = document.createElement('p');
  p.className = 'inline';
  p.innerHTML = text;

  return p;
}

/**
 * Populates the select with filenames from the conf folder
 * @param {String} dir The configuration directory
 * @param {String} id The ID of the options element
 */
function populateSelect(dir, id) {
  const select = document.getElementById(id);

  const dirList = readConfDirSync(dir);

  for (let i = 0; i < dirList.length; ++i) {
    const option = document.createElement('option');
    option.innerHTML = dirList[i].split('.')[0];
    select.appendChild(option);
  }
}

populateSelect('Controllers', 'controller-select');
populateSelect('Robots', 'robot-select');

/**
 * Clears the mode-specific configuration screen
 */
function clearChoice() {
  const confContainer = document.getElementById('conf-container');

  while (confContainer.firstChild) {
    confContainer.removeChild(confContainer.firstChild);
  }
}

/**
 * Sets up linear configuration
 */
function createLinear() {
  clearChoice();

  if (currentConf[selectedNode] == undefined) {
    currentConf[selectedNode] = {};
  }

  if (currentConf[selectedNode].mode !== 'Linear') {
    currentConf[selectedNode] = {
      mode: 'Linear',
      invert: 'Yes',
    };
  }

  const confContainer = document.getElementById('conf-container');
  const groups = findGroups();

  confContainer.appendChild(createInlineText('Group: '));
  const groupSelect = createSelect('Choose a group', groups);
  groupSelect.id = 'group-select';
  groupSelect.onchange = function() {
    currentConf[selectedNode].group = this.value;
  };
  confContainer.appendChild(groupSelect);

  confContainer.appendChild(document.createElement('br'));
  confContainer.appendChild(createInlineText('Invertable? '));
  confContainer.appendChild(createRadio('invert', ['Yes', 'No'], (event) => {
    const value = event.path[0].id.split('-')[1];
    currentConf[selectedNode].invert = value;
  }));
}

/**
 * Loads linear configuration
 */
function loadLinear() {
  const conf = currentConf[selectedNode];

  for (const item in conf) {
    if (conf.hasOwnProperty(item)) {
      switch (item) {
        case 'invert':
          document.getElementById(`invert-${conf.invert}`).checked = true;
          break;
        case 'group':
          document.getElementById('group-select').value = conf.group;
      }
    }
  }
}

/**
 * Creates a row in the
 * @param {Number} index The index of the row
 */
function createPresetRow(index) {
  const items = {Servos: []};
  items.Groups = findGroups();
  const conf = findRobotConf();
  for (const servo in conf) {
    if (conf.hasOwnProperty(servo)) {
      items.Servos.push(servo);
    }
  }

  const itemSelect = createGroupedSelect('Choose an item', items);
  itemSelect.onchange = (event) => {
    const prevNode = prevousPresetSelect.node;
    const prevIndex = prevousPresetSelect.index;
    if (prevNode == selectedNode && prevIndex == index) {
      const item = prevousPresetSelect.item;
      if (currentConf[selectedNode].items.hasOwnProperty(item)) {
        delete currentConf[selectedNode].items[item];
      }
    }

    const value = document.getElementById(`preset-value-${index}`).value;
    currentConf[selectedNode].items[event.target.value] = parseInt(value);

    prevousPresetSelect = {
      node: selectedNode,
      item: event.target.value,
      index: index,
    };
  };

  itemSelect.id = `item-select-${index}`;
  const children = [createTableData(itemSelect)];

  const valueInput = document.createElement('input');
  valueInput.type = 'number';
  valueInput.min = 0;
  valueInput.max = 100;
  valueInput.value = 0;
  valueInput.id = `preset-value-${index}`;

  valueInput.onchange = () => {
    const item = document.getElementById(`item-select-${index}`).value;
    const value = document.getElementById(`preset-value-${index}`).value;
    if (item != 'choice') {
      currentConf[selectedNode].items[item] = parseInt(value);
    }
  };
  children.push(createTableData(valueInput));

  const row = createTableRow(children);
  document.getElementById('preset-table').appendChild(row);
}

/**
 * Sets up preset configuration
 */
function createPreset() {
  clearChoice();

  if (currentConf[selectedNode].mode !== 'Preset') {
    currentConf[selectedNode] = {
      mode: 'Preset',
      items: {},
    };
  }

  const header = [createTableHeaderText('Item'),
    createTableHeaderText('Percentage')];

  const addRowButton = document.createElement('button');
  addRowButton.onclick = () => {
    const length = document.getElementById('preset-table').rows.length;
    createPresetRow(length);
  };

  addRowButton.innerHTML = '+';
  header.push(createTableHeader(addRowButton));

  const removeRowButton = document.createElement('button');
  removeRowButton.onclick = () => {
    const table = document.getElementById('preset-table');
    const index = table.rows.length - 1;

    if (index > 0) {
      const value = document.getElementById(`item-select-${index}`).value;
      table.deleteRow(index);
      delete currentConf[selectedNode].items[value];
    }
  };

  removeRowButton.innerHTML = '-';
  header.push(createTableHeader(removeRowButton));

  const table = createTable(header);
  table.id = 'preset-table';
  document.getElementById('conf-container').appendChild(table);

  createPresetRow(0);
}

/**
 * Loads preset configuration
 */
function loadPreset() {
  const conf = currentConf[selectedNode];

  for (const item in conf) {
    if (conf.hasOwnProperty(item)) {
      switch (item) {
        case 'items':
          const itemSelect = document.getElementById('item-select');
          // This will need to be fixed once the UI supports multiple items
          for (const item in conf.items) {
            if (conf.items.hasOwnProperty(item)) {
              itemSelect.value = item;
            }
          }
          break;
      }
    }
  }
}

/**
 * Updates the configuration screen to reflect the button clicked
 * @param {String} name The name of the button
 */
function buttonClick(name) {
  selectedNode = name;

  const button = document.getElementById(`${name}-button`);
  const previousSelect = document.getElementsByClassName('selected');
  for (let i = 0; i < previousSelect.length; ++i) {
    previousSelect[i].className = '';
  }
  button.className = 'selected';

  const value = document.getElementById(`${name}-select`).value;
  const preconfigured = currentConf[selectedNode].mode == value;

  switch (value) {
    case 'Linear':
      if (previousMode !== value) {
        createLinear();
      } else if (!preconfigured) {
        currentConf[selectedNode] = {
          mode: 'Linear',
          group: 'choice',
          invert: 'Yes',
        };
      }

      loadLinear();
      break;
    case 'Preset':
      if (previousMode !== value) {
        createPreset();
      } else if (!preconfigured) {
        currentConf[selectedNode] = {
          mode: 'Preset',
          items: {'choice': 0},
        };
      }

      loadPreset();
      break;
    default:
      clearChoice();
      break;
  }

  previousMode = value;
}

/**
 * Adds a node to the controller node list
 * @param {String} name The name of the node
 * @return {Node} A table row containing the text and select
 */
function addNode(name) {
  const text = document.createElement('button');
  text.className = 'inline';
  text.innerHTML = name;
  text.id = `${name}-button`;
  text.onclick = function() {
    buttonClick(name);
  };

  const select = createSelect('Select', controlTypes);
  select.className = 'groupelect';
  select.id = `${name}-select`;
  select.onchange = function() {
    buttonClick(name);
  };

  currentConf[name] = {};

  const children = [createTableData(text), createTableData(select)];
  const row = createTableRow(children);
  return row;
}

const controllerSelect = document.getElementById('controller-select');
const robotSelect = document.getElementById('robot-select');

/**
 * Updates the controller node list
 * @return {null} Null return to satisfy Deepscan error
 */
function controllerChange() {
  currentConf.controller = controllerSelect.value;

  const conf = JSON.parse(readConfSync(
      `Controllers/${controllerSelect.value}.json`));

  const headings = [createTableHeaderText('Item'),
    createTableHeaderText('Mode')];

  const rows = [createTableRow(headings)];
  for (const node in conf.nodes) {
    if (conf.nodes.hasOwnProperty(node)) {
      rows.push(addNode(node));
    }
  }

  document.body.appendChild(createTable(rows));

  return null;
}

/**
 * Updates the robot configuration value
 * @return {null} Null return to satisfy Deepscan error
 */
function robotChange() {
  currentConf.robot = robotSelect.value;

  return null;
}


controllerSelect.onchange = controllerChange();
robotSelect.onchange = robotChange();
