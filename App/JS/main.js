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
var multipliers = [[false, -1], [false, -1]]
