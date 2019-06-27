import socketserver as SocketServer
import sys
from GPIO import *
from emuBot import *

numberOfActiveDynamixels = 9

def loopServoReset(setup):
    for ID in range(1,numberOfActiveDynamixels+1):
        try:
            softwareResetServo(ID)
            if ID == numberOfActiveDynamixels:
                print("---------- // -----------")
            if setup:
                if ID <= 4:
                    wheelMode(ID)
                else:
                    jointMode(ID)
        except:
            print("Setup of ID: " + str(ID) + " failed.")

loopServoReset(True)

lastValues = [0 for i in range(5)]


class MyUCPHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        self.data = self.request[0].decode('utf-8').strip()
        new = self.data.split('\n')
        for i in new:
            if i != "":
              if 0:
                 print(new)
              else:
                if i == "restart":
                    restart()
                elif i == "softwareResetServos":
                    loopServoReset(False)
                else:
                    ID = int(i[0]+i[1])
                    if ID < 5:
                        try:
                            if lastValues[ID] != int(i[2:]):
                                moveWheel(ID, int(i[2:]))
                                lastValues[ID] = int(i[2:])
                        except e:
                            print(e)
                            print('brokeWheel ',ID)
                    else:
                        pos, speed = map(int, [round(float(x)) for x in i.split()[1:]])
                        try:
                            moveJoint(ID, pos, speed)
                        except:
                            print(i[2:-4])
                            print('BrokeJoint ', ID)
               # print(i)
           # else:
            #    print(i)

if __name__ == "__main__":
    HOST, PORT = "", 9999

SocketServer.UDPServer.allow_reuse_address = True
server = SocketServer.UDPServer((HOST, PORT), MyUCPHandler)

print('Dynamixel Server Started')
server.serve_forever()
