const {Controller} = require('../../lib/controller');
const fs = require('fs');
const controllers = [];
const configs = {};

/**
 * Updates the relevant progress bar when called via the 'change' event
 * @param {Number} index The index of the controller
 * @param {String} item The name of the node
 * @param {Number} value The new value of the node
 */
function handleChange(index, item, value) {
  if (document.getElementById(`controller-${index}`) == null) {
    generateNodes(index);
  }

  const node = controllers[index].nodes[item];
  const progress = document.getElementById(`${index}-${item}`);
  progress.value = node.isButton? value : value + 1;
}

/**
 * Generates a label containing an input for a given node
 * @param {Number} index The index of the controller
 * @param {String} key The key of the specific controller node
 * @return {Node} The generated label
 */
function generateLabel(index, key) {
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = key;
  input.id = `${index}-${key}-input`;
  input.addEventListener('change', (event) => {
    const oldName = event.target.id.split('-')[1];
    const newName = event.target.value;
    renameNode(oldName, newName, index);
    event.target.id = `${index}-${newName}-input`;

    if (controllers[index].saved) {
      saveController(index);
    }
  });

  label.appendChild(input);
  return label;
}

/**
 * Generates a progress bar containing an input for a given node
 * @param {Number} index The index of the controller
 * @param {String} key The key of the specific controller node
 * @return {Node} The generated label
 */
function generateProgress(index, key) {
  const node = controllers[index].nodes[key];
  const progress = document.createElement('progress');
  progress.id = `${index}-${key}`;
  progress.value = node.min;
  progress.max = node.isButton? node.max : 2;

  return progress;
}

/**
 * Generates a name input for a controller
 * @param {Number} index The index of the controller
 * @return {Node} The generated input
 */
function generateName(index) {
  const name = document.createElement('input');
  name.type = 'text';
  name.id = `name-${index}`;
  if (controllers[index].saveLocation !== null) {
    name.value = controllers[index].saveLocation;
  }

  name.addEventListener('change', () => {
    saveController(index);
  });

  return name;
}

/**
 * Generates a progress bar & input for every node in the controller
 * @param {Number} index The index of the controller
 */
function generateNodes(index) {
  const controller = controllers[index];
  const parent = document.createElement('div');
  parent.id = `controller-${index}`;
  parent.appendChild(generateName(index));
  parent.appendChild(document.createElement('br'));
  document.getElementById('controllers').appendChild(parent);

  for (const key in controller.nodes) {
    if (controller.nodes.hasOwnProperty(key)) {
      const node = controller.nodes[key];
      parent.appendChild(generateProgress(index, key));
      parent.appendChild(generateLabel(index, key));
      parent.appendChild(document.createElement('br'));

      handleChange(index, key, node.value);
    }
  }
}

/**
 * Updates the listings of controllers
 */
function updateControllers() {
  for (let index = 0; index < 4; ++index) {
    const nodes = controllers[index].nodes;
    controllers[index].onchange = (item, value) => {
      handleChange(index, item, value);
    };
    controllers[index].updateNodes();
    for (const node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        handleChange(index, node, nodes[node].value);
      }
    }
    scanForConfig(controllers[index].id, index);
  }
}

/**
 * Scans the controller configuration directory for matching files
 * @param {String} id The ID of the controller
 * @param {Number} index The index of the controller
 * @return {Promise} A promise that resolves with true if config is found
 */
function scanForConfig(id, index) {
  return new Promise((resolve, reject) => {
    const path = './src/conf/Controllers';
    const files = fs.readdirSync(path);

    if (Object.entries(configs).length === 0) {
      for (let i = 0; i < files.length; ++i) {
        const data = fs.readFileSync(`${path}/${files[i]}`);
        const config = JSON.parse(data.toString());
        const name = files[i].split('.')[0];
        configs[name] = {id: config.id};
      }
    }

    for (const item in configs) {
      if (configs.hasOwnProperty(item)) {
        const config = configs[item];
        if (config.id === id) {
          loadController(item, index);
          resolve(true);
        }
      }
    }

    resolve(false);
  });
}

/**
 * Handles the connection of a controller
 * @param {Number} index The index of the controller
 */
function handleConnect(index) {
  console.log('Controller connected');
  const gamepad = navigator.getGamepads()[index];

  scanForConfig(gamepad.id, index).then((found) => {
    if (!found) {
      if (Object.keys(controllers[index].nodes).length === 0) {
        controllers[index].id = gamepad.id;
        for (let axis = 0; axis < gamepad.axes.length; ++axis) {
          controllers[index].addControllerNode(`Unnamed axis #${axis}`,
              false, axis, [0, 1]);
        }
        for (let button = 0; button < gamepad.buttons.length; ++button) {
          controllers[index].addControllerNode(`Unnamed button #${button}`,
              true, button, [0, 1]);
        }
      }
      controllers[index].updateNodes();
    }

    updateControllers();
  });
}

/**
 * Handles the disconnection of a controller
 * @param {Number} index The index of the controller
 */
function handleDisconnect(index) {
  console.log('Controller disconnected');
  document.getElementById(`controller-${index}`).remove();
  removeChildren(index);
  resetController(index);
}

/**
 * Resets a controller to default state
 * @param {Number} index The index of the controller
 */
function resetController(index) {
  controllers[index] = new Controller('', index);
  controllers[index].saved = false;
  controllers[index].saveLocation = null;
  controllers[index].on('connect', () => {
    return handleConnect(index);
  });
  controllers[index].on('disconnect', () => {
    return handleDisconnect(index);
  });
}

for (let i = 0; i < 4; ++i) {
  controllers.push(null);
  resetController(i);
}

/**
 * Renames a node for a given controller
 * @param {String} oldName The name of the node
 * @param {String} newName The new name of the node
 * @param {Number} index The index of the controller
 */
function renameNode(oldName, newName, index) {
  const nodes = controllers[index].nodes;
  Object.defineProperty(nodes, newName,
      Object.getOwnPropertyDescriptor(nodes, oldName));
  delete nodes[oldName];
  controllers[index].updateNodes();

  document.getElementById(`${index}-${oldName}`).id = `${index}-${newName}`;
  const input = document.getElementById(`${index}-${oldName}-input`);
  input.id = newName;
  input.value = newName;
}

/**
 * Generates the configuration of a given controller
 * @param {Number} index The index of the controller
 * @return {Object} The generated config
 */
function generateConfig(index) {
  const controller = controllers[index];
  const config = {};
  config.id = controller.id;
  config.index = controller.index;
  config.controller = controller.name;
  config.nodes = {};

  for (const key in controller.nodes) {
    if (controller.nodes.hasOwnProperty(key)) {
      const node = controller.nodes[key];
      config.nodes[key] = {};
      config.nodes[key].isButton = node.isButton;
      config.nodes[key].index = node.index;
      config.nodes[key].min = node.min;
      config.nodes[key].max = node.max;
    }
  }

  return config;
}

/**
 * Removes all children in a controller visualisation div
 * @param {Number} index The index of the controller
 */
function removeChildren(index) {
  const parent = document.getElementById(`controller-${index}`);
  if (parent !== null) {
    const children = parent.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i];
      parent.removeChild(child);
    }
  }
}

/**
 * Loads a compatible controller for editing
 * @param {String} name The name of the controller file
 * @param {Number} index The index of the controller
 */
function loadController(name, index) {
  const path = `./src/conf/Controllers/${name}.json`;
  fs.readFile(path, (err, data) => {
    if (err) {
      console.error('Error reading config file:');
      console.error(err);
    } else {
      const config = JSON.parse(data);
      const nodes = config.nodes;

      controllers[index].nodes = {};
      removeChildren(index);

      for (const item in nodes) {
        if (nodes.hasOwnProperty(item)) {
          const node = nodes[item];
          controllers[index].addControllerNode(item, node.isButton,
              node.index, [node.min, node.max]);
        }
      }

      generateNodes(index);
      controllers[index].updateNodes();
      document.getElementById(`name-${index}`).value = name;
    }
  });
}

/**
 * Saves a given controller's config
 * @param {Number} index The index of the controller
 */
function saveController(index) {
  const name = document.getElementById(`name-${index}`).value;
  if (name === '' || name == null) {
    return;
  }

  const config = JSON.stringify(generateConfig(index));

  fs.writeFile(`./src/conf/Controllers/${name}.json`, config, (err) => {
    if (err) {
      console.error('Failed to write file! Do you have access?');
      console.error(err);
    } else {
      console.log('Saved config successfully!');
      controllers[index].saved = true;
      controllers[index].saveLocation = name;
    }
  });
}

// This should be migrated to animations for cleaner code
setInterval(() => {
  for (let i = 0; i < 4; ++i) {
    controllers[i].loop();
  }
}, 1);
