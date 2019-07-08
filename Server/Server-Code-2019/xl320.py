#!/usr/bin/env python
# -*- coding: utf-8 -*-

################################################################################
# Copyright 2017 ROBOTIS CO., LTD.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
################################################################################

# Author: Ryu Woon Jung (Leon)

#
# *********     Read and Write Example      *********
#
#
# Available Dynamixel model on this example : All models using Protocol 2.0
# This example is designed for using a Dynamixel PRO 54-200, and an USB2DYNAMIXEL.
# To use another Dynamixel model, such as X series, see their details in E-Manual(emanual.robotis.com) and edit below variables yourself.
# Be sure that Dynamixel PRO properties are already set as %% ID : 1 / Baudnum : 1 (Baudrate : 57600)
#

import os
from dynamixel_sdk import *                    # Uses Dynamixel SDK library

# Control table address
ADDR_PRO_TORQUE_ENABLE      = 24               # Control table address is different in Dynamixel model
ADDR_PRO_GOAL_POSITION      = 30
ADDR_PRO_PRESENT_POSITION   = 37

# Protocol version
PROTOCOL_VERSION            = 2.0               # See which protocol version is used in the Dynamixel

# Default setting
DXL_ID                      = 13                 # Dynamixel ID : 1
BAUDRATE                    = 1000000             # Dynamixel default baudrate : 57600
DEVICENAME                  = '/dev/ttyUSB0'    # Check which port is being used on your controller
                                                # ex) Windows: "COM1"   Linux: "/dev/ttyUSB0" Mac: "/dev/tty.usbserial-*"

TORQUE_ENABLE               = 1                 # Value for enabling the torque
TORQUE_DISABLE              = 0                 # Value for disabling the torque
DXL_MINIMUM_POSITION_VALUE  = 205           # Dynamixel will rotate between this value
DXL_MAXIMUM_POSITION_VALUE  = 819            # and this value (note that the Dynamixel would not move when the position value is out of movable range. Check e-manual about the range of the Dynamixel you use.)
DXL_MOVING_STATUS_THRESHOLD = 20                # Dynamixel moving status threshold

index = 0
dxl_goal_position = [DXL_MINIMUM_POSITION_VALUE, DXL_MAXIMUM_POSITION_VALUE]         # Goal position


# Initialize cameraPortHandler instance
# Set the port path
# Get methods and members of cameraPortHandlerLinux or cameraPortHandlerWindows
cameraPortHandler = PortHandler(DEVICENAME)

# Initialize PacketHandler instance
# Set the protocol version
# Get methods and members of Protocol1PacketHandler or Protocol2PacketHandler
packetHandler = PacketHandler(PROTOCOL_VERSION)

# Open port
if cameraPortHandler.openPort():
    #print("Succeeded to open the port")
    pass
else:
    print("Failed to open the port")
    print("Press any key to terminate...")
    getch()
    quit()


# Set port baudrate
if cameraPortHandler.setBaudRate(BAUDRATE):
    #print("Succeeded to change the baudrate")
    pass
else:
    print("Failed to change the baudrate")
    print("Press any key to terminate...")
    getch()
    quit()

ID = 12
goal_position = 500
def cameraMode(ID):
    # Enable Dynamixel Torque
    dxl_comm_result, dxl_error = packetHandler.write1ByteTxRx(cameraPortHandler, ID, ADDR_PRO_TORQUE_ENABLE, TORQUE_ENABLE)
    if dxl_comm_result != COMM_SUCCESS:
        print("%s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
        print("%s" % packetHandler.getRxPacketError(dxl_error))
    else:
        pass
        #print("Dynamixel has been successfully connected")

cameraMode(12)
cameraMode(13)
def moveCamera(ID, goal_position):
    #print("Press any key to continue! (or press ESC to quit!)")
    #if getch() == chr(0x1b):
        #break
    # Write goal position
    dxl_comm_result, dxl_error = packetHandler.write4ByteTxRx(cameraPortHandler, ID, ADDR_PRO_GOAL_POSITION, goal_position)
    if dxl_comm_result != COMM_SUCCESS:
        print("111%s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
        print("222%s" % packetHandler.getRxPacketError(dxl_error))

    # Read present position
    dxl_present_position, dxl_comm_result, dxl_error = packetHandler.read4ByteTxRx(cameraPortHandler, ID, ADDR_PRO_PRESENT_POSITION)
    #if dxl_comm_result != COMM_SUCCESS:
        #print("333%s" % packetHandler.getTxRxResult(dxl_comm_result))
    if dxl_error != 0:
        print("444%s" % packetHandler.getRxPacketError(dxl_error))

    #print("555[ID:%03d] GoalPos:%03d  PresPos:%03d" % (DXL_ID, dxl_goal_position[index], dxl_present_position))

    # if not abs(goal_position - dxl_present_position) > DXL_MOVING_STATUS_THRESHOLD:
    #     print('Broken :(')


# moveCamera(12, 1023)
# moveCamera(13, 500)
# # Disable Dynamixel Torque
# dxl_comm_result, dxl_error = packetHandler.write1ByteTxRx(cameraPortHandler, DXL_ID, ADDR_PRO_TORQUE_ENABLE, TORQUE_DISABLE)
# if dxl_comm_result != COMM_SUCCESS:
#     print("666%s" % packetHandler.getTxRxResult(dxl_comm_result))
# elif dxl_error != 0:
#     print("777%s" % packetHandler.getRxPacketError(dxl_error))

# # Close port
# cameraPortHandler.closePort()
