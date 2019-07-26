import os
from dynamixel_sdk import *

servo_types = []
connected_servos = []

class Dynamixel:
  def __init__(self, control_table):
    self.control_table = control_table

def initialise():
  for root, dirs, files in os.walk("./Servos/", topdown=False):
    for name in files:
      print(os.path.join(root, name))
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
      # print(control_table)
      # print(control_table['Punch']['Address'])
      servo_types.append(Dynamixel(control_table))