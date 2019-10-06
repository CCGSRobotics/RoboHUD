[![Build Status](https://travis-ci.com/CCGSRobotics/RoboHUD.svg?branch=master)](https://travis-ci.com/CCGSRobotics/RoboHUD)
[![Documentation Status](https://readthedocs.org/projects/robohud/badge/?version=latest)](https://robohud.readthedocs.io/en/latest/?badge=latest)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/CCGSRobotics/RoboHUD)
# RoboHUD GUI

The RoboHUD GUI stack provides a user interface for controlling a robot running on any Dynamixel servos. Currently, the GUI is undergoing a [major redesign](https://github.com/CCGSRobotics/RoboHUD/projects/5), with the following functionality currently implemented:
* Support for any Dynamixel running either protocol 1 or 2 (and both at the same time)
* "Remote Dynamixel Wizard", to control every item in a servo's control table
* Graphical creation of robots, with custom group mapping

Features on the roadmap (may be already implemented, check the projects page for more current information):
* Controller configuration & profiles
* Custom sensors & graphing
* Multiple camera streams
* Gyroscope/accelerometer/magnetometer positional visualisation
* Full customisability through settings

# Reporting bugs & requesting features
If you have any issue with the software, please feel free to [create an issue](https://github.com/CCGSRobotics/RoboHUD/issues/new), and we can take a look at addressing your problem. To view the currently tracked bugs, take a look at the [bugs project page](https://github.com/CCGSRobotics/RoboHUD/projects/6). There is also a [feature requests](https://github.com/CCGSRobotics/RoboHUD/projects/2) project if you would like to see what other people are asking for!

# Contributing
## For those who have an idea of what they would like to do & how to do it
If you have an idea and don't need much guidance - great! The [specifications document](https://app.gitbook.com/@ccgsrobotics/s/specifications/) might have some useful information surrounding more detailed information, so you don't have to go looking through the code.

## For those who need some guidance
Check the [feature requests](https://github.com/CCGSRobotics/RoboHUD/projects/2) project, or the [issue tracker](https://github.com/CCGSRobotics/RoboHUD/issues). Take a look around, ask questions, and see what interests you! Additionally, you can always come down to TG11 to have a chat, see what we're working on and discuss what you can contribute.

The work-in-progress [guide](https://app.gitbook.com/@ccgsrobotics/s/robohud/) may also be of some help for those starting development.

## Linting your code
The file [lint.py](Scripts/lint.py) can be utilised to easily lint code that you have been working on. For example, if you want to lint your HTML file and supporting JS file, you can use the following code:

`python3 Scripts/lint.py App/index.html App/JS/client.js`

## Creating a pull request
Once your code has been written, [make a pull request](https://github.com/CCGSRobotics/RoboHUD/compare) so that your contributions can be merged into the repository's master branch!

# Installation
There are multiple options for installation. With the installation script, you can install the client and/or the server software. To do so, simply use the provided installation script in [Scripts/install.sh](Scripts/install.sh).

## Installing the client
To install the GUI on a UNIX-based system (Linux or MacOS), run the following command:

`curl -o- -L https://raw.githubusercontent.com/CCGSRobotics/RoboHUD/master/Scripts/install.sh | sh`

## Installing the server
To copy the server across to the robot, you will need to have run the necessary [setup scripts](https://github.com/CCGSRobotics/WiFi-Setup-Scripts), so that the SSH server and WiFi are properly configured. To install the server, make sure that you are in the RoboHUD directory `cd RoboHUD/` and run the following command, making sure to replace HOSTNAME with the robot's hostname (in most cases this will be pi@192.168.100.1):

`cd RoboHUD; chmod +x Scripts/install.sh && ./Scripts/install.sh -o -h HOSTNAME`

The hostname is made up of 2 parts: the username (usually pi) @ the ip address (usually 192.168.100.1). That is why the standard hostname is pi@192.168.100.1.

## Installing both
To install both parts of the GUI, run:

`curl -o- -L https://raw.githubusercontent.com/CCGSRobotics/RoboHUD/master/Scripts/install.sh | sh -ss -- -h HOSTNAME`

## Using the script without curl
As mentioned previously, the script is located in the Scripts/ directory, for use when the GUI is already downloaded (as demonstrated in [Installing the server](#installing-the-server)).
