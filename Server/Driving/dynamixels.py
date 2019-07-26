import os
from dynamixel_sdk import *


port_handler = PortHandler('/dev/ttyUSB0')
# Protocol 1 packet handler:
p1 = PacketHandler(1.0)
# Protocol 2 packet handler:
p2 = PacketHandler(2.0)

servo_types = {}
connected_servos = []

class Dynamixel:
  def __init__(self, name, id, protocol, control_table):
    self.name = name
    self.id = id
    self.protocol = protocol
    self.control_table = control_table

  def query(self, item, detail):
    return self.control_table[item][detail]

  def writeValue(self, name, value):
    if name in self.control_table:
      if 'W' in self.query(name, 'Access'):
        size = self.query(name, 'Size(Byte)')
        if size == 1:
          print(1)
          if self.protocol == 1:
            p1.write1ByteTxRx(port_handler, self.id, self.query(name, 'Address'), value)
          else:
            p2.write1ByteTxRx(port_handler, self.id, self.query(name, 'Address'), value)
        elif size == 2:
          print(2)
          if self.protocol == 1:
            p1.write2ByteTxRx(port_handler, self.id, self.query(name, 'Address'), value)
          else:
            p2.write2ByteTxRx(port_handler, self.id, self.query(name, 'Address'), value)
        elif size == 4:
          print(4)
          if self.protocol == 1:
            p1.write4ByteTxRx(port_handler, self.id, self.query(name, 'Address'), value)
          else:
            p2.write4ByteTxRx(port_handler, self.id, self.query(name, 'Address'), value)

def initialise():
  for root, dirs, files in os.walk("./Servos/", topdown=False):
    for name in files:
      print(name)
      path = os.path.join(root, name)
      table = open(path, 'r').readlines()
      first_line = table[0].split(', ')
      control_table = {}
      for i in range(1, len(table)):
        line = table[i].split(', ')
        build = {}
        build[line[2]] = {}
        for item in range(len(line)):
          if line[item] != line[2]:
            new = line[item].strip()
            if new.isdigit():
              new = int(new)
            build[line[2]][first_line[item].strip()] = new
        control_table = {**control_table, **build}
      servo_types[os.path.splitext(name)[0]] = Dynamixel(os.path.splitext(name)[0], 1, 1, control_table)