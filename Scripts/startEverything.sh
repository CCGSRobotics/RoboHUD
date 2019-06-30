#!/bin/bash
gnome-terminal -e ~/GUI/RoboHUD/Scripts/startPython.sh
echo "Started Python Server"
gnome-terminal -e ~/GUI/RoboHUD/Scripts/startGrabber.sh
echo "Started Sensor Server"
#ssh pi@192.168.100.1 -C sudo motion -c Desktop/RoboHUD-master/Scripts/motion.conf
#echo "Started Camera Stream"
