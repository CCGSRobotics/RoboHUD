const {readConfDirSync, readConfSync} = require('../../lib/io');
const controlTypes = ['Linear'];
const currentConf = {};
let previousMode = '';

/**
 * Finds all groups in a robot config
 * @return {Array} The groups found
 */
function findGroups() {
  const groups = [];
  const filename = currentConf.robot;
  const conf = JSON.parse(readConfSync(`Robots/${filename}.json`));

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
 * Creates a placeholder option for a select box
 * @param {String} text The text to fill the placeholder
 * @return {Node} The created placeholder
 */
function createPlaceholder(text) {
  const option = document.createElement('option');
  option.value = '';
  option.innerHTML = text;
  option.disabled = true;
  option.selected = true;

  return option;
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
 * Creates a select element with the given placeholder and children
 * @param {String} placeholder The placeholder text
 * @param {Array<String>} children The liat of options
 * @return {Node} The generated select element
 */
function createSelect(placeholder, children) {
  const select = document.createElement('select');
  select.appendChild(createPlaceholder(placeholder));

  for (let child = 0; child < children.length; ++child) {
    const option = document.createElement('option');
    const text = children[child];
    option.value = text;
    option.innerHTML = text;
    select.appendChild(option);
  }

  return select;
}

/**
 * Creates a div element with each child as a radio input
 * @param {String} name The name of the category
 * @param {Array<String>} children A list of children
 * @param {Function} handle The click handler for each button
 * @return {Node} The div filled with radio buttons
 */
function createRadio(name, children, handle) {
  const parent = document.createElement('div');

  for (let child = 0; child < children.length; ++child) {
    const input = document.createElement('input');
    const text = children[child];

    input.type = 'radio';
    input.name = name;
    input.value = text;
    input.id = `${name}-${text}`;
    input.onclick = handle;

    if (child == 0) {
      input.checked = true;
    }

    parent.appendChild(input);

    const label = document.createElement('label');
    label.for = text;
    label.innerHTML = text;
    parent.appendChild(label);
  }

  return parent;
}

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
 * @param {String} name The name of the controller node
 */
function createLinear(name) {
  clearChoice();
  currentConf[name] = {
    mode: 'Linear',
  };

  const confContainer = document.getElementById('conf-container');
  const groups = findGroups();

  confContainer.appendChild(createInlineText('Group: '));
  const groupSelect = createSelect('Choose a group', groups);
  groupSelect.onchange = function() {
    currentConf[name].controls = this.value;
  };
  confContainer.appendChild(groupSelect);

  confContainer.appendChild(document.createElement('br'));
  confContainer.appendChild(createInlineText('Invertable? '));
  confContainer.appendChild(createRadio('invert', ['Yes', 'No'], (event) => {
    const value = event.path[0].id.split('-')[1];
    currentConf[name].invert = value;
  }));
  currentConf[name].invert = 'Yes';
}

/**
 * Loads linear configuration
 * @param {String} name The name of the controller node
 */
function loadLinear() {
  // To Do
}

/**
 * Updates the configuration screen to reflect the button clicked
 * @param {String} name The name of the button
 */
function buttonClick(name) {
  const button = document.getElementById(`${name}-button`);
  const previousSelect = document.getElementsByClassName('selected');
  for (let i = 0; i < previousSelect.length; ++i) {
    previousSelect[i].className = '';
  }
  button.className = 'selected';

  const value = document.getElementById(`${name}-select`).value;

  switch (value) {
    case 'Linear':
      previousMode == value? loadLinear(name) : createLinear(name);
      break;
  }

  previousMode = value;
}

const controllerNodes = document.getElementById('controller-nodes');

/**
 * Adds a node to the controller node list
 * @param {String} name The name of the node
 */
function addNode(name) {
  const container = document.createElement('div');

  const text = document.createElement('button');
  text.className = 'inline';
  text.innerHTML = name;
  text.id = `${name}-button`;
  text.onclick = function() {
    buttonClick(name);
  };
  container.appendChild(text);

  const select = createSelect('Select', controlTypes);
  select.className = 'controlSelect';
  select.id = `${name}-select`;
  select.onchange = function() {
    buttonClick(name);
  };

  container.appendChild(select);

  controllerNodes.appendChild(container);

  currentConf[name] = {};
}

const controllerSelect = document.getElementById('controller-select');
const robotSelect = document.getElementById('robot-select');

/**
 * Updates the controller node list
 */
function controllerChange() {
  currentConf.controller = controllerSelect.value;

  const conf = JSON.parse(readConfSync(
      `Controllers/${controllerSelect.value}.json`));
  for (const node in conf.nodes) {
    if (conf.nodes.hasOwnProperty(node)) {
      addNode(node);
    }
  }
}

/**
 * Updates the robot configuration value
 */
function robotChange() {
  currentConf.robot = robotSelect.value;
}


controllerSelect.onchange = controllerChange();
robotSelect.onchange = robotChange();
