import socketserver
import re
from dynamixels import *

servos = {}

# wheels[5] = initialise_dynamixel('ax-18a', 5, 1)

class UDPHandler(socketserver.BaseRequestHandler):
  def handle(self):
    self.data = self.request[0].decode('utf-8').strip()
    new = self.data.split('\n')
    for i in new:
      if len(re.findall("\((init|delete|modify|mode)\)-.+", i)) == 1:
        # Fancy regular expression to check if server is sending other commands
        # WARNING: This code is VERY experimental and will crash if
        # The wrong input is given

        cmd = re.match("\((init|delete|modify|mode)\)", i).group(1)
        if cmd == "init":
          ID, protocol = map(int, re.findall("-.+-.$", i)[0].split('-')[1:])
          servos[ID] = initialise_dynamixel('ax-18a', ID, protocol)
        elif cmd == "mode":
          ID, mode = map(str, re.findall("-.+-.+$", i)[0].split('-')[1:])
          ID = int(ID)
          if ID in servos:
            if mode == 'wheel':
              print('wheel')
              servos[ID].wheel_mode()
            elif mode == 'joint':
              servos[ID].joint_mode()
        elif cmd == 'delete':
          ID = int(re.findall('-.+$', i)[0][1:])
          if ID in servos:
            servos.pop(ID)
      elif i.count('-') == 1:
        # Wheel
        ID, speed = map(int, i.split('-'))
        if ID in servos:
          servos[ID].write_value('Moving Speed', speed)
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