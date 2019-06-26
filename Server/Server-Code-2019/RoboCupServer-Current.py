import socketserver as SocketServer
import sys
from GPIO import *
SwitchOFF()
SwitchON()
from emuBot import *

wheelMode(1)
wheelMode(2)
wheelMode(3)
wheelMode(4)
jointMode(5)
jointMode(6)
jointMode(7)
jointMode(8)
jointMode(9)
#jointMode(10)
#jointMode(11)
#moveWheel(4, 1023)
lastValues = [0 for i in range(5)]
numberOfActiveDynamixels = 9

class MyTCPHandler(SocketServer.BaseRequestHandler):
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
                    for ID in range(1,numberOfActiveDynamixels):
                        softwareResetServo(ID)
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
                            #moveJoint(ID, int(i[2:-4]), i[-4:])
                        except:
                            print(i[2:-4])
                            print('BrokeJoint ', ID)
               # print(i)
           # else:
            #    print(i)

if __name__ == "__main__":
    HOST, PORT = "", 9999

SocketServer.UDPServer.allow_reuse_address = True
server = SocketServer.UDPServer((HOST, PORT), MyTCPHandler)

print('Server Started')
server.serve_forever()
