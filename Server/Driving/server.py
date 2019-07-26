import socketserver
from dynamixels import *

class UDPHandler(socketserver.BaseRequestHandler):
  def handle(self):
    self.data = self.request[0].decode('utf-8').strip()
    new = self.data.split('\n')
    for i in new:
      print(i)

socketserver.UDPServer.allow_reuse_address = True
server = socketserver.UDPServer(("", 5001), UDPHandler)

print('Dynamixel Server Started!')
server.serve_forever()