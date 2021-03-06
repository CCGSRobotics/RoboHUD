var net = require('net');
var dgram = require('dgram');
var client = new net.Socket();
var childProcess = require('child_process');
var clientSocket = new dgram.createSocket('udp4');
const settings = require('./JS/Resources/Settings/flipperBot.json')
const jointSpeed = settings["Client"]["Controller"]["Joints"].JointSpeed
const panDirectionDefault = settings["Client"]["Controller"]["Joints"].PanDirection
const tiltDirectionDefault = settings["Client"]["Controller"]["Joints"].TiltDirection
const leftCameraButton = settings["Client"]["Controller"]["Buttons"].CameraPanLeft
const rightCameraButton = settings["Client"]["Controller"]["Buttons"].CameraPanRight
const upCameraButton = settings["Client"]["Controller"]["Buttons"].CameraTiltUp
const downCameraButton = settings["Client"]["Controller"]["Buttons"].CameraTiltDown
var panDirection = panDirectionDefault
var tiltDirection = tiltDirectionDefault
var video;
var lastVals = [];
var multipliers = [[false, 1], [false, 1]]
var flipperSelect = true // true: front flippers | false: back flippers
let gamepad;

// Flipper limits are set inside the client, to avoid fake [Overload] Errors occuring on the server side.
var flipperJointLimits = {
  5: [1323,3372], // ID: 5  | Model: MX-28
  6: [1323,3372], // ID: 6  | Model: MX-28
  7: [1023,3072], // ID: 7  | Model: MX-28
  8: [1023,3072], // ID: 8  | Model: MX-28
  9: [200,2560],    // ID: 9  | Model: MX-28
  10: [512, 1024],    // ID: 10 | Model: AX-12
  12: [0, 1023],  // ID: 12  | Model: XL-320
  13: [205, 816]  // ID: 13  | Model: XL-320
  // [0,1023],    // ID: 10 | Model: AX-12
}
var b_button_state = false;
var grabberMultipler = 0;
var grabberStep = 1;
var grabberValue = 0;
var canMove = true;
var cameraStep = 2
