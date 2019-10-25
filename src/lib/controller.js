const EventEmitter = require('events');

/**
 * A class representing a single button/axis on a controller
 */
class ControllerInputNode extends EventEmitter {
  /**
   * Defines basic information about the ControllerInputNode
   * @param {Boolean} button If the node is a button or not
   * @param {Number} index The index of the node
   * @param {Array} range The min & max range
   */
  constructor(button, index, range) {
    super();

    this.isButton = button;
    this.index = index;
    [this.min, this.max] = range;
    this.value = this.min;
  }

  /**
   * Updates the state of the input node
   * @param {Object} gamepad The relevant gamepad object
   */
  update(gamepad) {
    let rawValue;
    if (this.isButton) {
      rawValue = gamepad.buttons[this.index].value;
    } else {
      rawValue = gamepad.axes[this.index];
    }

    const value = rawValue / this.max;

    if (this.value !== value) {
      this.emit('change', value);
      this.value = value;
    }
  }
}

/**
 * A class representing an entire controller
 */
class Controller extends EventEmitter {
  /**
   * Defines basic information about the controller
   * @param {String} id The ID of the gamepad
   * @param {Number} index The index of the gamepad
   */
  constructor(id, index) {
    super();

    this.id = id;
    this.index = index;
    this.connected = false;

    this.nodes = {};

    this.onchange = function(item, value) {
      console.log(`${item}: ${value}`);
    };
  }

  /**
   * Adds a new controller node to the list of nodes
   * @param {String} name The name to give the input node
   * @param {Boolean} button If the node is a button or not
   * @param {Number} index The index of the node
   * @param {Array} range The min & max range
   */
  addControllerNode(name, button, index, range) {
    this.nodes[name] = new ControllerInputNode(button, index, range);
  }

  updateNodes() {
    for (const item in this.nodes) {
      if (this.nodes.hasOwnProperty(item)) {
        this.nodes[item].removeAllListeners('change');
        this.nodes[item].on('change', (value) => {
          this.onchange(item, value);
        });
      }
    }
  }

  /**
   * Checks if anything has updated since loop() was last called
   */
  loop() {
    const gamepad = navigator.getGamepads()[this.index];
    if (gamepad !== null) {
      if (!this.connected) {
        this.emit('connect');
        this.connected = true;
      }
      for (const key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) {
          this.nodes[key].update(gamepad);
        }
      }
    } else {
      if (this.connected) {
        this.emit('disconnect');
        this.connected = false;
      }
    }
  }
}

module.exports.Controller = Controller;
