import socketserver
from dynamixels import *

class UDPHandler(socketserver.BaseRequestHandler):
  def handle(self):
    self.data = self.request[0].decode('utf-8').strip()
    new = self.data.split('\n')
    for i in new:
      if i.count('-') == 1:
        # Wheel
        ID, speed = map(int, i.split('-'))
        print('Wheel ID {} moving at speed {}'.format(ID, speed))
      elif i.count('-') == 2:
        # Joint
        ID, pos, speed = map(int, i.split('-'))
        print('Joint ID {} moving to position {} at speed {}'.format(ID, pos, speed))
      else:
        print('Invalid command! {}'.format(i))

socketserver.UDPServer.allow_reuse_address = True
server = socketserver.UDPServer(("", 5001), UDPHandler)

print('Dynamixel Server Started!')
server.serve_forever()