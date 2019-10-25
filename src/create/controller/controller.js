const {Controller} = require('../../lib/controller');
const controllers = [];

/**
 * Updates the listings of controllers
 */
function updateControllers() {
  const parent = document.getElementById('parent');
  for (let index = 0; index < 4; ++index) {
    const nodes = controllers[index].nodes;
    controllers[index].onchange = function(item, value) {
      console.log(`${item}: ${value}`);
    };
    for (const node in nodes) {
      if (nodes.hasOwnProperty(node)) {
        controllers[index].updateNodes();
      }
    }
  }
}

for (let i = 0; i < 4; ++i) {
  controllers.push(new Controller('', i));
  controllers[i].on('connect', () => {
    console.log('Controller connected');
    const gamepad = navigator.getGamepads()[i];
    controllers[i].id = gamepad.id;
    for (let axis = 0; axis < gamepad.axes.length; ++axis) {
      controllers[i].addControllerNode(`Unnamed axis #${axis}`, false, axis, [0, 1]);
    }
    for (let button = 0; button < gamepad.buttons.length; ++button) {
      controllers[i].addControllerNode(`Unnamed button #${button}`, true, button, [0, 1]);
    }

    controllers[i].updateNodes();
    updateControllers();
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

setInterval(() => {
  for (let i = 0; i < 4; ++i) {
    controllers[i].loop();
  }
}, 1);
