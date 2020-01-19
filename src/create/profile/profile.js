const {readConfDirSync, readConfSync} = require('../../lib/io');
const controlTypes = ['Linear'];
const currentConf = {};

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
  const items = [];

  for (let i = 0; i < dirList.length; ++i) {
    const config = JSON.parse(readConfSync(
        `${dir}/${dirList[i]}`).toString());

    items.push(config);

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
 * @param {String} name The name of the controller node
 */
function chooseLinear(name) {
  currentConf[name] = {
    mode: 'Linear',
  };

  const confContainer = document.getElementById('conf-container');
  const groups = findGroups();

  const select = document.createElement('select');
  select.appendChild(createPlaceholder('Choose a group'));

  for (let i = 0; i < groups.length; ++i) {
    const option = document.createElement('option');
    option.value = groups[i];
    option.innerHTML = groups[i];
    select.appendChild(option);
  };

  select.onchange = function() {
    currentConf[name].controls = this.value;
  };

  confContainer.appendChild(select);
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

  clearChoice();
  switch (value) {
    case 'Linear':
      chooseLinear(name);
      break;
  }
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

  const select = document.createElement('select');
  select.className = 'controlSelect';
  select.appendChild(createPlaceholder('Select'));
  select.id = `${name}-select`;
  select.onchange = function() {
    buttonClick(name);
  };

  for (let i = 0; i < controlTypes.length; ++i) {
    const option = document.createElement('option');
    option.innerHTML = controlTypes[i];
    select.appendChild(option);
  }
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
