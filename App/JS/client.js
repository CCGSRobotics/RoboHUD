for (let i = 0; i <= 20; i++) {
  lastVals.push(0);
}
/*
var GrabberSlider = document.getElementById("grabberSpeed");
var GrabberOutput = document.getElementById("grabberSpeedDisplay");
// Update the current slider value (each time you drag the slider handle)
GrabberSlider.oninput = function() {
  GrabberOutput.innerHTML = "Grabber Speed: " + this.value + "%";
  moveWheel(11,grabberMultipler * this.value * 1023/100);
}

var WristSlider = document.getElementById("wristPosition");
var WristOutput = document.getElementById("wristPositionDisplay");
// Update the current slider value (each time you drag the slider handle)
WristSlider.oninput = function() {
  WristOutput.innerHTML = "Wrist Position: " + this.value + "%";
  moveJointWithPercentage(10,this.value);
}
*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function updateGrabberState() {
  canMove = false;
  document.getElementById('grabberPositionDisplay').innerHTML = `Grabber position: ${Math.round((grabberValue/60)*100)}%`;
  // document.getElementById('grabberPosition').value = grabberValue;
  setTimeout(function() {
    canMove = true;
  }, 250);
}

async function moveGrabber() {
  var children = document.getElementById('grabberParent').children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.type == "checkbox" && child.checked) {
      await sleep(250)
      clientSocket.send(`${child.value}i${grabberValue}`, 25565, '192.168.100.1');
    }
    // clientSocket.send(`${grabberValue}`, 25565, '192.168.100.1');
  }
}

// function moveGrabberSlider() {
//   var slider = document.getElementById('grabberPosition');
//   if (canMove) {
//     grabberValue = parseInt(slider.value);
//     console.log(grabberValue, slider)
//     updateGrabberState();
//   }
// }

document.onkeydown = async function(e) {
  var key = e.key;
  if (key == "ArrowLeft") {
    clientSocket.send('11-1024', 9999, '192.168.100.1');
  } else if (key == "ArrowRight") {
    clientSocket.send('111024', 9999, '192.168.100.1');
  } else if (key == "ArrowDown" && grabberValue > 0 && canMove) {
    grabberValue -= grabberStep;
    updateGrabberState();
    moveGrabber();
    // clientSocket.send(`${grabberValue}`, 25565, '192.168.100.1');
  } else if (key == "ArrowUp" && grabberValue < 60 && canMove) {
    grabberValue += grabberStep;
    updateGrabberState();
    moveGrabber();
    // clientSocket.send(`${grabberValue}`, 25565, '192.168.100.1');
  }
}

document.onkeyup = async function(e) {
  var key = e.key;
  if (key == "ArrowLeft" || key == "ArrowRight") {
    clientSocket.send('110', 9999, '192.168.100.1');
  }
}

function grabberDirection(G_M) {grabberMultipler = G_M;}

function sendWithCheck(message, port, ip) {
  if (!message.includes('NaN')) {
    clientSocket.send(message, port, ip);
  } else {
    console.log(message);
  }
}
// Tells the server to restart the dynamixels through the relay circuit.
function restart() {sendWithCheck("restart", 9999, '192.168.100.1');}

function softwareResetServos() {sendWithCheck("softwareResetServos", 9999, '192.168.100.1');}

/**
 * Moves any dynamixel that has been assigned jointMode in terms of\
 * the percentage of maximum rotation of the servo
 * @param {!number} ID The ID of the dynamixel to control
 * @param {!number} percentage The percentage out of 100\
 * that you want to move the joint to
 * @example <caption>Moving servo 5 to 50% of its range,\
 * or straight forwards</caption>
 * moveJointWithPercentage(5, 50);
 */

function moveJointWithPercentage(ID, percentage) {
  destination = 1023 + (percentage * 2048) / 100;
  if (ID == 5 || ID == 8) {
    destination = 3071 - (percentage*2048)/100;
  }
  if (ID == 9) {
    destination = (percentage * 2680) / 100;
  }
  // Ensures sent servo destination data fits within their limits.
  if(destination > flipperJointLimits[ID-5][1]) {destination = flipperJointLimits[ID-5][1];}
  if(destination < flipperJointLimits[ID-5][0]) {destination = flipperJointLimits[ID-5][0];}

  sendWithCheck(`0${ID} ${destination} 200`, 9999, '192.168.100.1');
}

function changeFlipperSelection() {
  if(flipperSelect) {flipperSelect = false;}
  else {flipperSelect = true;}
}

/**
 * Sends a wheel value to the server given an ID and a speed,\
 * providing the instruction has not already been sent
 * @param {!number} dynamixel The ID of the dynamixel you wish to move
 * @param {!number} val The speed at which you wish to move
 */
function sendWheelValue(dynamixel, val) {
  if (!(lastVals[dynamixel] == val)) {
    sendWithCheck(`0${dynamixel}${val}`, 9999, '192.168.100.1');
    lastVals[dynamixel] = val;
  }
}

/**
 * Interprets an action on the controller to pass onto sendWheelValue
 * @param {!number} dynamixel The ID of the dynamixel you wish to move
 * @param {!number} axis The index of the axis on the gamepad to get data from
 * @param {object} gamepad Any gamepad object in the array returned from\
 *  navigator.getGamepads()
 * @param {boolean} sticks True if using sticks, false for triggers
 */
function moveWheel(dynamixel, axis, gamepad, sticks) {
  let val;
  if (sticks) {
    val = Math.round((gamepad.axes[axis] + 1) * 512);
    val = (val - 512) * -2;
  } else {
    val = Math.round((gamepad.buttons[axis].value) * 1024);
  }

  if (val < -1024 || val > 1024) {
    console.error('Controller value is out of bounds! (' + val + ')');
  }

  if (dynamixel == 2 || dynamixel == 4) {
    val = -val;
    val *= multipliers[0][1];
  } else {
    val *= multipliers[1][1];
  }

  if (-150 <= val >= 150) {
    val = 0;
  }
  sendWheelValue(dynamixel, val);
}

/**
 * Moves the arm joint of a servo if the corresponding button has been pressed
 * @param {!number} dynamixel The ID of the dynamixel you wish to move
 * @param {!number} upButton The index of the button for moving the arm up
 * @param {!number} downButton The index of the button for moving the arm down
 */
function moveArm(dynamixel, upButton, downButton) {
  gamepad = navigator.getGamepads()[0];
  if (gamepad.buttons[upButton].value > 0) {
    if (lastVals[dynamixel] != lastVals[dynamixel]+1 && lastVals[dynamixel] < 100) {
      moveJointWithPercentage(dynamixel, lastVals[dynamixel]+1);
      lastVals[dynamixel] += 1;
    }
  } else if (gamepad.buttons[downButton].value > 0) {
    if (lastVals[dynamixel] != lastVals[dynamixel] - 1 &&
      lastVals[dynamixel] > 0) {
      moveJointWithPercentage(dynamixel, lastVals[dynamixel] - 1);
      lastVals[dynamixel] -= 1;
    }
  }
}

/**
 * Interprts an action on the controller to pass onto moveJointWithPercentage
 * @param {!number} dynamixel The ID of the dynamixel you wish to move
 * @param {!number} axis The index of the axis on the gamepad to get
 *  postional data from
 * @param {boolean} holdMode [false] If the flipper is moved by clicking
 *  the axis button
 * @param {number} holdButton [0] The index of the button to hold
 */
function moveFlipper(dynamixel, axis) {
  const gamepad = navigator.getGamepads()[0];
  const change = Math.round((gamepad.axes[axis])*5);
  if(flipperSelect && (dynamixel == 5 || dynamixel == 6)) {
    var val = lastVals[dynamixel] + change;
    if(val < 0) {val = 0;}
    else if (val > 100) {val = 100;}
    if (val != lastVals[dynamixel]) {
      lastVals[dynamixel] = val;
      moveJointWithPercentage(dynamixel, val);
    }
  }
  else if(!flipperSelect && (dynamixel == 7 || dynamixel == 8)) {
    var val = lastVals[dynamixel] + change;
    if(val < 0) {val = 0;}
    else if (val > 100) {val = 100;}
    if (val != lastVals[dynamixel]) {
      lastVals[dynamixel] = val;
      moveJointWithPercentage(dynamixel, val);
    }
  }

}

/**
 * Writes the default values to the server
 */
async function writeDefaultValues() {
  panDirection = panDirectionDefault;
  tiltDirection = tiltDirectionDefault;
  for (let i = 1; i <= 4; i++) {
    sendWheelValue(i, 0);
    lastVals[i] = 0;
  }
  for (let i = 5; i <= 8; i++) {
    moveJointWithPercentage(i, 100);
    lastVals[i] = 100;
  }
  moveJointWithPercentage(9, 0);
  lastVals[9] = 0;
}

/**
 *
 * @param {object} gamepad Any gamepad object in the array
 * returned from navigator.getGamepads()
 * @param {boolean} sticks [false] True if the user controls via sticks,
 * false for triggers
 */
async function pollGamepad(gamepad, sticks = false) {
  gamepad = navigator.getGamepads()[0];

  moveWheel(1, 6, navigator.getGamepads()[0], false);
  moveWheel(3, 6, navigator.getGamepads()[0], false);
  moveWheel(2, 7, navigator.getGamepads()[0], false);
  moveWheel(4, 7, navigator.getGamepads()[0], false);
  moveFlipper(5, 1);
  moveFlipper(7, 1);
  moveFlipper(6, 3);
  moveFlipper(8, 3);
  moveArm(9, 3, 0);
}

// client.connect(5000, '192.168.100.1', function() {
//   console.log("Connected to server interface");
// })
//
// function writeToServer(data) {
//   client.write(data);
//   console.log(`Wrote '${data}' to server`);
// }

let gamepadInterval;
writeDefaultValues();
window.addEventListener('gamepadconnected', function(event) {
  gamepadInterval = setInterval(() => {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad.buttons[9].value > 0) {
      writeDefaultValues();
      multipliers = [[false, -1], [false, -1]];
    }

    pollGamepad(event.gamepad, 40, false);

    if (gamepad.buttons[5].pressed && !multipliers[0][0]) {
      multipliers[0][1] *= -1;
      multipliers[0][0] = true;
    } else if(!gamepad.buttons[5].pressed){
      multipliers[0][0] = false;
    }

    if (gamepad.buttons[4].pressed && !multipliers[1][0]) {
      multipliers[1][1] *= -1;
      multipliers[1][0] = true;
    } else if(!gamepad.buttons[4].pressed) {
      multipliers[1][0] = false;
    }

    if (gamepad.buttons[16].pressed) {
      // restart() Current mechanicak relay isn't working
      softwareResetServos();
    }
    if (gamepad.buttons[8].pressed && !b_button_state) {
      b_button_state = true;
      changeFlipperSelection();
    }
    else if(!gamepad.buttons[8].pressed) {
      b_button_state = false;
    }
  }, 50);
});
window.addEventListener('gamepaddisconnected', function(event) {
  clearInterval(gamepadInterval);
});
