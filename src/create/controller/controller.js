const {Controller} = require('../../lib/controller');
const controllers = [];

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
 * Generates a progress bar for every node in the controller
 * @param {Number} index The index of the controller
 */
function generateNodes(index) {
  const controller = controllers[index];
  const parent = document.createElement('div');
  parent.id = `controller-${index}`;
  document.getElementById('controllers').appendChild(parent);

  for (const key in controller.nodes) {
    if (controller.nodes.hasOwnProperty(key)) {
      const node = controller.nodes[key];
      const progress = document.createElement('progress');
      progress.id = `${controller.index}-${key}`;

      progress.value = node.min;
      progress.max = node.isButton? node.max : 2;
      parent.appendChild(progress);
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
    for (const node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        controllers[index].updateNodes();
      }
    }
  }
}

/**
 * Handles the connection of a controller
 * @param {Number} index The index of the controller
 */
function handleConnect(index) {
  console.log('Controller connected');
  const gamepad = navigator.getGamepads()[index];
  controllers[index].id = gamepad.id;
  for (let axis = 0; axis < gamepad.axes.length; ++axis) {
    controllers[index].addControllerNode(`Unnamed axis #${axis}`,
        false, axis, [0, 1]);
  }
  for (let button = 0; button < gamepad.buttons.length; ++button) {
    controllers[index].addControllerNode(`Unnamed button #${button}`,
        true, button, [0, 1]);
  }

  controllers[index].updateNodes();
  updateControllers();
}

/**
 * Handles the disconnection of a controller
 * @param {Number} index The index of the controller
 */
function handleDisconnect(index) {
  console.log('Controller disconnected');
  document.getElementById(`controller-${index}`).remove();
}

for (let i = 0; i < 4; ++i) {
  controllers.push(new Controller('', i));
  controllers[i].on('connect', () => {
    return handleConnect(i);
  });
  controllers[i].on('disconnect', () => {
    return handleDisconnect(i);
  });
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
}

// This should be migrated to animations for cleaner code
setInterval(() => {
  for (let i = 0; i < 4; ++i) {
    controllers[i].loop();
  }
}, 1);
