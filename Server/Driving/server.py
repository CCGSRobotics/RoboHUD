import socketserver
import re
from dynamixels import *

servos = {}

# servos[12] = initialise_dynamixel('xl320', 12, 2)

class UDPHandler(socketserver.BaseRequestHandler):
  def handle(self):
    self.data = self.request[0].decode('utf-8').strip()
    new = self.data.split('\n')
    for i in new:
      if len(re.findall("\((init|delete|modify|mode|read)\)-.+", i)) == 1:
        # Fancy regular expression to check if server is sending other commands
        # WARNING: This code is VERY experimental and will crash if
        # The wrong input is given

        items = i.split('-')
        cmd = re.match("\((init|delete|modify|mode|read)\)", items[0]).group(1)
        if cmd == "init":
          ID, protocol = map(int, items[1:])
          servos[ID] = initialise_dynamixel('ax-18a', ID, protocol)
        elif cmd == "modify":
          ID, item, value = map(str, items[1:])
          ID = int(ID)
          value = int(value)
          if ID in servos:
            servos[ID].write_value(item, value)
        elif cmd == "read":
          ID, item = map(str, items[1:])
          ID = int(ID)
          if ID in servos:
            print(servos[ID].read_value(item))
        elif cmd == "mode":
          ID, mode = map(str, items[1:])
          ID = int(ID)
          if ID in servos:
            if mode == 'wheel':
              servos[ID].wheel_mode()
            elif mode == 'joint':
              servos[ID].joint_mode()
        elif cmd == 'delete':
          ID = int(items[1])
          if ID in servos:
            servos.pop(ID)
      elif i.count('-') == 1:
        # Wheel
        ID, speed = map(int, i.split('-'))
        if ID in servos and servos[ID].is_wheel:
          servos[ID].write_value('Moving Speed', speed)
        elif ID not in servos:
          print('There is no servo of ID {} initialised!'.format(ID))
        else:
          print('Servo {} is not a wheel!'.format(ID))
      elif i.count('-') == 2:
        # Joint
        ID, pos, speed = map(int, i.split('-'))
        if ID in servos and servos[ID].is_joint:
          servos[ID].write_value('Goal Position', pos)
          servos[ID].write_value('Moving Speed', speed)
        elif ID not in servos:
          print('There is no servo of ID {} initialised!'.format(ID))
        else:
          print('Servo {} is not a joint!'.format(ID))
      else:
        print('Invalid command! {}'.format(i))

socketserver.UDPServer.allow_reuse_address = True
server = socketserver.UDPServer(("", 5001), UDPHandler)

print('Dynamixel Server Started!')
server.serve_forever()