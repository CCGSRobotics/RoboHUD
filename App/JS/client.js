for (let i = 0; i <= 20; i++) {
  lastVals.push(0);
}

lastVals[10] = 100
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

function lineToAngle(ctx, x1, y1, length, angle, colour) {

    angle *= Math.PI / 180;

    var x2 = x1 + length * Math.cos(angle),
        y2 = y1 + length * Math.sin(angle);

    ctx.beginPath();
    ctx.strokeStyle = colour;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();

    return {x: x2, y: y2};
}

function drawFlipperLines(ctx) {
  context.beginPath()
  context.font = '30px sans-serif'
  context.fillText('Up', 0, 175)
  context.fillText('Down', 250, 175)
  context.closePath()
  lineToAngle(ctx, 100, 100, 50, 180 * (lastVals[6]/100) + 90, 'Green')
  lineToAngle(ctx, 200, 100, 50, -180 * (lastVals[8]/100) + 90, 'Green')
  lineToAngle(ctx, 100, 250, 50, 180 * (lastVals[5]/100) + 90, 'Red')
  lineToAngle(ctx, 200, 250, 50, -180 * (lastVals[7]/100) + 90, 'Red')
}

var flipperCanvas = document.getElementById('flippers')
var context = flipperCanvas.getContext('2d')

drawFlipperLines(context)
// lineToAngle(context, 50, 50, 25, 45)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

var lastCameraVals = [0, 0]
var cameraLimits = [90, 180]

// function moveCamera() {
//   var gamepad = navigator.getGamepads()[0];
//   if (gamepad.buttons[leftCameraButton].value > 0 && lastCameraVals[1] + cameraStep <= cameraLimits[1]) {
//     console.log('a')
//     clientSocket.send(`${lastCameraVals[0]},${lastVals[1] + cameraStep}`, 25565, '10.0.0.10');
//     lastVals[1] += cameraStep;
//   } else if (gamepad.buttons[rightCameraButton].value > 0 && lastCameraVals[1] - cameraStep >= 0) {
//     clientSocket.send(`${lastCameraVals[0]},${lastVals[1] - cameraStep}`, 25565, '10.0.0.10');
//     lastVals[1] -= cameraStep;
//   }
// }

var waiter = 10

function updateGrabberState() {
  document.getElementById('grabberPositionDisplay').innerHTML = `Grabber position: ${Math.round((grabberValue/60)*100)}%`;
}
var grabberServos = [true, true, true]
var grabberValues = [0, 0, 0]
async function moveGrabber(multiplier) {
  return new Promise(async function(resolve) {
    var children = document.getElementById('grabberParent').children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.type == "checkbox" && child.checked) {
        grabberServos[parseInt(child.value) - 1] = true
        grabberValue += (grabberStep * multiplier)
      } else {
        grabberServos[parseInt(child.value) - 1] = false
      }
      // clientSocket.send(`${grabberValue}`, 25565, '10.0.0.10');
    }
    if (grabberServos == [true, true, true]) {
      await sleep(waiter)
      clientSocket.send(`${grabberValue}`, 25565, '10.0.0.10')
    }

    for (var i = 0; i < 3; i++) {
      if (grabberServos[i] == true) {
        await sleep(waiter);
        clientSocket.send(`${i+1}i${grabberValue}`, 25565, '10.0.0.10');
      }
    }
    resolve;
  })
}

// function moveGrabberSlider() {
//   var slider = document.getElementById('grabberPosition');
//   if (canMove) {
//     grabberValue = parseInt(slider.value);
//     console.log(grabberValue, slider)
//     updateGrabberState();
//   }
// }

// document.onkeydown = async function(e) {
//   var key = e.key;
//   if (key == "ArrowLeft") {
//     // sendWheelValue(11, -1024);
//     clientSocket.send('111024', 9999, '10.0.0.10');
//   } else if (key == "ArrowRight") {
//     clientSocket.send('11-1024', 9999, '10.0.0.10');
//   } else if (key == "ArrowDown" && grabberValue > 0) {
//     // grabberValue -= grabberStep;
//     updateGrabberState();
//     await moveGrabber(-1);
//     // clientSocket.send(`${grabberValue}`, 25565, '10.0.0.10');
//   } else if (key == "ArrowUp" && grabberValue < 60) {
//     // grabberValue += grabberStep;
//     updateGrabberState();
//     await moveGrabber(1);
//     // clientSocket.send(`${grabberValue}`, 25565, '10.0.0.10');
//   }
// }

// document.onkeyup = async function(e) {
//   var key = e.key;
//   if (key == "ArrowLeft" || key == "ArrowRight") {
//     clientSocket.send('110', 9999, '10.0.0.10');
//   }
// }

function grabberDirection(G_M) {grabberMultipler = G_M;}

function sendWithCheck(message, port, ip) {
  if (!message.includes('NaN')) {
    clientSocket.send(message, port, ip);
  } else {
    console.log(message);
  }
}
// Tells the server to restart the dynamixels through the relay circuit.
function restart() {sendWithCheck("restart", 9999, '10.0.0.10');}

function softwareResetServos() {sendWithCheck("softwareResetServos", 9999, '10.0.0.10');}

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
  lastVals[ID] = percentage;
  destination = 1023 + (percentage * 2048) / 100;
  if (ID == 5 || ID == 8) {
    destination = 3071 - (percentage*2048)/100;
  }
  if (ID == 9) {
    destination = (percentage * 2680) / 100;
  }
  if (ID == 10) {
    destination = (percentage * 476) / 100;
  }
  if (ID == 12) {
    destination = (percentage * 1023) / 100
  }
  // console.log(flipperJointLimits[ID])
  // Ensures sent servo destination data fits within their limits.
  if(destination > flipperJointLimits[ID][1]) {destination = flipperJointLimits[ID][1];}
  if(destination < flipperJointLimits[ID][0]) {destination = flipperJointLimits[ID][0];}
  if (ID < 9) {
    sendWithCheck(`0${ID} ${destination} 200`, 9999, '10.0.0.10');
  } else if (ID == 9) {
    sendWithCheck(`09 ${destination} 1024`, 9999, '10.0.0.10');
  } else if (ID == 12 || ID == 13) {
      console.log(destination)
      sendWithCheck(`${ID} ${destination} 100`, 9999, '127.0.0.1');
  } else {
    sendWithCheck(`${ID} ${destination} 200`, 9999, '10.0.0.10');
  }
}

function changeFlipperSelection() {
  if(flipperSelect) {
    flipperDirection.innerHTML = `Flippers: back`
    flipperSelect = false;
  }
  else {
    flipperDirection.innerHTML = `Flippers: front`
    flipperSelect = true;
  }
}

/**
 * Sends a wheel value to the server given an ID and a speed,\
 * providing the instruction has not already been sent
 * @param {!number} dynamixel The ID of the dynamixel you wish to move
 * @param {!number} val The speed at which you wish to move
 */
function sendWheelValue(dynamixel, val) {
  if (!(lastVals[dynamixel] == val)) {
    sendWithCheck(`0${dynamixel}${val}`, 9999, '10.0.0.10');
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

  // if (-150 <= val >= 150) {
  //   val = 0;
  // }
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
 * Moves the wrist joint of a servo if the corresponding button has been pressed
 * @param {!number} dynamixel The ID of the dynamixel you wish to move
 * @param {!number} upButton The index of the button for moving the arm up
 * @param {!number} downButton The index of the button for moving the arm down
 */
function moveWrist(dynamixel, upButton, downButton) {
  gamepad = navigator.getGamepads()[0];
  if (gamepad.buttons[upButton].value > 0) {
    if (lastVals[dynamixel] < 100) {
      moveJointWithPercentage(dynamixel, lastVals[dynamixel]+1);
      lastVals[dynamixel] += 1;
    }
  } else if (gamepad.buttons[downButton].value > 0) {
    if (lastVals[dynamixel] > 0) {
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
    var val = lastVals[dynamixel] - change;
    if(val < 0) {val = 0;}
    else if (val > 100) {val = 100;}
    if (val != lastVals[dynamixel]) {
      lastVals[dynamixel] = val;
      moveJointWithPercentage(dynamixel, val);
    }
  }

}

var flipperDirection = document.getElementById('flipperDirection');
var leftWheelDirection = document.getElementById('leftWheelsDirection');
var rightWheelDirection = document.getElementById('rightWheelsDirection');

function centerCamera() {
  clientSocket.send('10 1023 200', 9999, '10.0.0.10')
  lastVals[10] = 1023
  clientSocket.send('12 512 200', 9999, '10.0.0.10')
  lastVals[12] = 512
  clientSocket.send('13 816 200', 9999, '10.0.0.10')
  lastVals[13] = 816
}

function cameraLeft() {
  clientSocket.send('12 0 200', 9999, '10.0.0.10')
  lastVals[12] = 0
}

function cameraRight() {
  clientSocket.send('12 1023 200', 9999, '10.0.0.10')
  lastVals[12] = 1023
}

function panCamera(ID, leftButton, rightButton) {
  var gamepad = navigator.getGamepads()[0];
  if (gamepad.buttons[leftButton].value > 0 && lastVals[ID] + 5 <= flipperJointLimits[ID][1]) {
    console.log(lastVals[ID] + 5)
    moveJointWithPercentage(ID, lastVals[ID] + 5)
    lastVals[ID] += 5
  } else if (gamepad.buttons[rightButton].value > 0 && lastVals[ID] - 5 >= flipperJointLimits[ID][0]) {
    moveJointWithPercentage(ID, lastVals[ID] - 5)
    lastVals[ID] -= 5
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

  moveJointWithPercentage(10, 100);
  lastVals[10] = 100;

  centerCamera()

  // moveJointWithPercentage(11, 50);
  // lastVals[11] = 50;

  grabberValue = 0;
  moveGrabber(1);

  flipperDirection.innerHTML = 'Flippers: front';
  leftWheelDirection.innerHTML = 'Left wheels: forwards';
  rightWheelDirection.innerHTML = 'Right wheels: forwards'

  setTimeout(function() {
    clientSocket.send('165,100', 25565, '10.0.0.10')
    lastCameraVals = [165, 100]
  }, 100)
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
  moveArm(9, 3, 2);
  moveWrist(10, 1, 0);
  panCamera(12, 14, 15)
  // moveJointWithPercentage(11,50);

  // moveCamera()
  context.beginPath();
  context.clearRect(0, 0, 100000000000, 100000000000000);
  context.stroke();
  context.closePath();
  drawFlipperLines(context);
}

function moveStraight() {
  clientSocket.send('011024', 9999, '10.0.0.10')
  clientSocket.send('031024', 9999, '10.0.0.10')
  clientSocket.send('02-1024', 9999, '10.0.0.10')
  clientSocket.send('04-1024', 9999, '10.0.0.10')
}

function stop() {
  clientSocket.send('010', 9999, '10.0.0.10')
  clientSocket.send('030', 9999, '10.0.0.10')
  clientSocket.send('020', 9999, '10.0.0.10')
  clientSocket.send('040', 9999, '10.0.0.10')
}
// client.connect(5000, '10.0.0.10', function() {
//   console.log("Connected to server interface");
// })
//
// function writeToServer(data) {
//   client.write(data);
//   console.log(`Wrote '${data}' to server`);
// }
let gamepadInterval;
console.log(lastVals)
writeDefaultValues();
window.addEventListener('gamepadconnected', function(event) {
  gamepadInterval = setInterval(() => {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad.buttons[9].value > 0) {
      writeDefaultValues();
      multipliers = [[false, 1], [false, 1]];
    }

    pollGamepad(event.gamepad, 40, false);

    if (gamepad.buttons[5].pressed && !multipliers[0][0]) {
      multipliers[0][1] *= -1;
      multipliers[0][0] = true;
      if (multipliers[0][1] == 1) {
        rightWheelDirection.innerHTML = `Right wheels: forwards`;
      } else {
        rightWheelDirection.innerHTML = `Right wheels: backwards`;
      }
    } else if(!gamepad.buttons[5].pressed){
      multipliers[0][0] = false;
    }
    

    if (gamepad.buttons[4].pressed && !multipliers[1][0]) {
      multipliers[1][1] *= -1;
      multipliers[1][0] = true;
      if (multipliers[1][1] == 1) {
        leftWheelDirection.innerHTML = `Left wheels: forwards`;
      } else {
        leftWheelDirection.innerHTML = `Left wheels: backwards`;
      }
    } else if(!gamepad.buttons[4].pressed) {
      multipliers[1][0] = false;
      // leftWheelDirection.innerHTML = `Left wheels: backwards`;
    }

    if (gamepad.buttons[16].pressed) {
      restart();
      //softwareResetServos();
    }
    if (gamepad.buttons[8].pressed && !b_button_state) {
      b_button_state = true;

      changeFlipperSelection();
    }
    // if (gamepad.buttons[15].pressed) {
    //   lastVals[11] = lastVals[11] - 10

    //   moveJointWithPercentage(11,lastVals[11]);
    // }
    // if (gamepad.buttons[14].pressed) {
    //   lastVals[11] = lastVals[11] - 10

    //   moveJointWithPercentage(11,lastVals[11]);
    // }

    else if(!gamepad.buttons[8].pressed) {
      b_button_state = false;
    }
  }, 50);
});
window.addEventListener('gamepaddisconnected', function(event) {
  clearInterval(gamepadInterval);
});
