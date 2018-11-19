import socketserver as SocketServer
import sys
from GPIO import *
#SwitchOFF()
#SwitchON()
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
jointMode(10)
jointMode(11)
#SwitchON() #Added for testing.

class MyTCPHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        while True:
            #sc.flush()
            self.data = self.request.recv(2048).decode('utf-8').strip()
            new = self.data.split('\n')
            for i in new:
                if i != "":
                  if 0:
                     print(new)
                  else:
                    if i == "ON":
                        SwitchON()
                    elif i == "OFF":
                        SwitchOFF()
                    else:
                        ID = int(i[0]+i[1])
                        if ID < 5:
                            try:
                                moveWheel(ID, int(i[2:]))
                            except: 
                                print('brokeWheel ',ID)
                                pass
                        else:
                            try:
                                moveJoint(ID, int(i[2:-4]), i[-4:])
                            except:
                                print('BrokeJoint ', ID)
                   # print(i)
               # else:
                #    print(i)
                
if __name__ == "__main__":
    HOST, PORT = "", 9999
    
SocketServer.TCPServer.allow_reuse_address = True
server = SocketServer.TCPServer((HOST, PORT), MyTCPHandler)

print('Servre Started')
server.serve_forever()



