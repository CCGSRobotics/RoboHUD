from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

# from py_read_serial import *
import socket

UDP_IP_ADDRESS = '127.0.0.1'
UDP_PORT_NO = 6789
clientSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# messages = {
#     0: 'CO2: ',
#     1: 'Temperature: '
# }

# numOfSensors = len(messages)

while 1:
    # for x in range(numOfSensors):
    #     while 1:
    #         try:
    #             sensor = readPins() # sensor = {'num': sensorID, 'value': some number}
    #             break
    #         except:
    #             pass
    #     if sensor['num'] == 1:
    #         sensor['value'] = round((57*(sensor['value']-20))/100,1)
    #     # print(messages[sensor['num']][0], sensor['value'], messages[sensor['num']][1])
    #     output = ""
    #     output += messages[sensor['num']]
    #     output += sensors['value']
    clientSock.sendto(bytes('hey', 'utf-8'), (UDP_IP_ADDRESS, UDP_PORT_NO))
