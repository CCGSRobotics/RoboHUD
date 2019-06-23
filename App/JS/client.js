for (var i = 0; i <= 20; i++) {
	lastVals.push(0);
}

function moveJointWithPercentage(ID, percentage) {
	destination = 1023 + (percentage * 2048) / 100;
	if (ID == 5 || ID == 8) {
		destination = 3071 - (percentage*2048)/100;
	}
	if (ID == 9) {
		destination = (percentage * 2680) / 100;
		console.log(destination);
	}
	clientSocket.send(`0${ID} ${destination} 200`, 9999, '192.168.100.1');
}

function sendWheelValue(dynamixel, val) {
	if (!(lastVals[dynamixel] == val)) {
		clientSocket.send(`0${dynamixel}${val}`, 9999, '192.168.100.1');
		lastVals[dynamixel] = val;
	}

}

function moveWheel(dynamixel, axis, gamepad, sticks) {
	var val;
	if (sticks) {
		val = Math.round((gamepad.axes[axis] + 1) * 512);
		val = (val - 512) * -2;
	} else {
		val = Math.round((gamepad.buttons[axis].value) * 1024);
	}

	if (val < -1024 || val > 1024) {
		console.error("Controller value is out of bounds! (" + val + ")");
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

function moveArm(dynamixel, upButton, downButton) {
	var gamepad = navigator.getGamepads()[0];
	if (gamepad.buttons[upButton].value > 0) {
		if (lastVals[dynamixel] != lastVals[dynamixel]+10 && lastVals[dynamixel] < 100) {
			moveJointWithPercentage(dynamixel, lastVals[dynamixel]+10);
			lastVals[dynamixel] += 10;
		}
	} else if (gamepad.buttons[downButton].value > 0) {
		if (lastVals[dynamixel] != lastVals[dynamixel] - 10 && lastVals[dynamixel] > 0) {
			moveJointWithPercentage(dynamixel, lastVals[dynamixel] - 10);
			lastVals[dynamixel] -= 10;
		}
	}
}

function moveFlipper(dynamixel, axis, holdMode, holdButton) {
	var gamepad = navigator.getGamepads()[0];
	var change = Math.round((gamepad.axes[axis])*10)
	if (holdMode && gamepad.buttons[holdButton].value > 0 || !holdMode && gamepad.buttons[dynamixel == 5? 10 : 11].value == 0) {
		var val = lastVals[dynamixel] + change;
		if(val >= 0 && val <= 100) {
			if (val != lastVals[dynamixel]) {
				lastVals[dynamixel] = val;
				moveJointWithPercentage(dynamixel, val);
			}
		}
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function writeStartingValues(interval) {
	panDirection = panDirectionDefault
	tiltDirection = tiltDirectionDefault
	for (var i = 1; i <= 4; i++) {
		sendWheelValue(i, 0);
		lastVals[i] = 0;
	}
	for (var i = 5; i <= 8; i++) {
		moveJointWithPercentage(i, 100);
		lastVals[i] = 100;
	}
	moveJointWithPercentage(9, 0);
	lastVals[9] = 0;
}

async function pollGamepad(gamepad, interval, sticks) {
		var gamepad = navigator.getGamepads()[0];

		moveWheel(1, 6, gamepad, sticks)
		moveWheel(3, 6, gamepad, sticks)
		moveWheel(2, 7, gamepad, sticks)
		moveWheel(4, 7, gamepad, sticks)
		moveFlipper(5, 1, false, 0);
		moveFlipper(7, 1, true, 10);
		moveFlipper(6, 3, false, 0);
		moveFlipper(8, 3, true, 11);
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
writeStartingValues();
window.addEventListener("gamepadconnected", function(event) {
	gamepadInterval = setInterval(() => {
		var gamepad = navigator.getGamepads()[0];
		if (gamepad.buttons[9].value > 0) {
			writeStartingValues();
			multipliers = [[false, -1], [false, -1]]
		}

		pollGamepad(event.gamepad, 40, false);

		if (gamepad.buttons[4].pressed && !multipliers[0][0]) {
			multipliers[0][1] *= -1;
			multipliers[0][0] = true;
		} else {
			multipliers[0][0] = false;
		}

		if (gamepad.buttons[5].pressed && !multipliers[1][0]) {
			multipliers[1][1] *= -1;
			multipliers[1][0] = true;
		} else {
			multipliers[1][0] = false;
		}

	}, 160);
});
window.addEventListener("gamepaddisconnected", function(event) {
	clearInterval(gamepadInterval);
});