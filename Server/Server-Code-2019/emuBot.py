import time
import threading

from dynamixel_sdk import *

BAUDRATE = 1000000

portHandler = PortHandler("/dev/ttyUSB0")
packetHandler = PacketHandler(1.0)

if portHandler.openPort():
  # print("Succeeded to open the port"
  pass
else:
  print("Failed to open the port")
  print("Press any key to terminate...")
  getch()
  quit()
if portHandler.setBaudRate(BAUDRATE):
  # print("Succeeded to change the baudrate")
  pass
else:
  print("Failed to change the baudrate")
  print("Press any key to terminate...")
  getch()
  quit()

def dxlErrors(commResult, error):
  if commResult != COMM_SUCCESS:
    print("%s" % packetHandler.getTxRxResult(commResult))
  elif error != 0:
    print("%s" % packetHandler.getRxPacketError(dxl_error))



def jointMode(ID):
  if ID < 9:
    dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 6, 1023)
    if dxl_comm_result != COMM_SUCCESS:
      print(str(ID) + " %s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
      print(str(ID) + " %s" % packetHandler.getRxPacketError(dxl_error))

    dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 8, 3072)
    if dxl_comm_result != COMM_SUCCESS:
      print(str(ID) + " %s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
      print(str(ID) + " %s" % packetHandler.getRxPacketError(dxl_error))
        
  elif ID == 9:    
    dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 6, 0)
    if dxl_comm_result != COMM_SUCCESS:
      print(str(ID) + " %s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
      print(str(ID) + " %s" % packetHandler.getRxPacketError(dxl_error))

    dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 8, 2560)
    if dxl_comm_result != COMM_SUCCESS:
      print(str(ID) + " %s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
      print(str(ID) + " %s" % packetHandler.getRxPacketError(dxl_error))
      
  elif ID > 9:
    dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 6, 0)
    if dxl_comm_result != COMM_SUCCESS:
      print(str(ID) + " %s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
      print(str(ID) + " %s" % packetHandler.getRxPacketError(dxl_error))

    dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 8, 1023)
    if dxl_comm_result != COMM_SUCCESS:
      print(str(ID) + " %s" % packetHandler.getTxRxResult(dxl_comm_result))
    elif dxl_error != 0:
      print(str(ID) + " %s" % packetHandler.getRxPacketError(dxl_error))



def wheelMode(ID):
  dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 6, 0)
  if dxl_comm_result != COMM_SUCCESS:
    print("%s" % packetHandler.getTxRxResult(dxl_comm_result))
  elif dxl_error != 0:
    print("%s" % packetHandler.getRxPacketError(dxl_error))

  dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 8, 0)
  if dxl_comm_result != COMM_SUCCESS:
    print("%s" % packetHandler.getTxRxResult(dxl_comm_result))
  elif dxl_error != 0:
    print("%s" % packetHandler.getRxPacketError(dxl_error))
  
  dxl_comm_result, dxl_error = packetHandler.write1ByteTxRx(portHandler, ID, 24, 1)
  if dxl_comm_result != COMM_SUCCESS:
    print("%s" % packetHandler.getTxRxResult(dxl_comm_result))
  elif dxl_error != 0:
    print("%s" % packetHandler.getRxPacketError(dxl_error))
  
  

def moveJoint(ID, position,speed):
  dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 30, position)
  if dxl_comm_result != COMM_SUCCESS:
      print(str(ID),"%s" % packetHandler.getTxRxResult(dxl_comm_result))
  elif dxl_error != 0:
      print(str(ID),"%s" % packetHandler.getRxPacketError(dxl_error))
  
  dxl_present_position, dxl_comm_result, dxl_error = packetHandler.read4ByteTxRx(portHandler, ID, 36)
  #if not abs(dxl_goal_position[index] - dxl_present_position) > 20: 
    #print("Servo with ID of %03d was %03d off target, outside acceptable range" % (ID, abs(position - dxl_present_position)))

def moveWheel(ID, speed):
  dxl_comm_result, dxl_error = packetHandler.write1ByteTxRx(portHandler, ID, 24, 0)
  if dxl_comm_result != COMM_SUCCESS:
    print("%s" % packetHandler.getTxRxResult(dxl_comm_result))
  elif dxl_error != 0:
    print("%s" % packetHandler.getRxPacketError(dxl_error))
    
  # Convert negative values of speed to between 1024 and 2047
  if speed < 0:
    # Limit allowed reverse speed to prevent errors
    if speed < -1024:
      speed = 2047
    else:
      speed = 1023 + -speed

  else:
    if speed > 1023:
      # Limit allowed forward speed to prevent errors
      speed = 1023
  
  
  dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 32, speed)
  dxlErrors(dxl_comm_result, dxl_error)

  dxl_comm_result, dxl_error = packetHandler.write2ByteTxRx(portHandler, ID, 30, 0)
  if dxl_comm_result != COMM_SUCCESS:
    print("%s" % packetHandler.getTxRxResult(dxl_comm_result))
  elif dxl_error != 0:
    print("%s" % packetHandler.getRxPacketError(dxl_error))
  
#jointMode(6)
