import os
from dynamixel_sdk import *


port_handler = PortHandler('/dev/ttyUSB0')
# Protocol 1 packet handler:
p1 = PacketHandler(1.0)
# Protocol 2 packet handler:
p2 = PacketHandler(2.0)

if port_handler.openPort():
  pass
else:
  print("Failed to open the port")

if port_handler.setBaudRate(1000000):
  pass
else:
  print("Failed to change the baudrate")

class Dynamixel:
  """
  An object representing a single Dynamixel

  The Dynamixel class contains the ability to read or write to any address
  in its control table, which is specified as a CSV file interpreted through
  the GUI.

  Attributes:
    name: The name of the CSV containing the relevant control table
    ID: The initial ID of the Dynamixel
    protocol: The protocol version of the servo - either 1 or 2
    control_table: A dictionary containing the control table, formatted as
      control_table[data name] = {Address, size etc}. This is generated
      by the initialise_dynamixel function
  """

  def __init__(self, name, ID, protocol, control_table):
    """
    Initialises the Dynamixel class with model, ID, protocol and control table
    """

    self.name = name
    self.ID = ID
    self.protocol = protocol
    self.control_table = control_table

  def query(self, item, detail):
    """
    Returns the value of the row (item) and column (detail)

    Args:
      item: The row in which to look in for the information
      detail: The column in which to look in for the information

    Returns:
      The data found at row (item) and column (detail)
    """

    return self.control_table[item][detail]

  def write_value(self, name, value):
    """
    Writes value to the address of name

    Args:
      name: The name of the data in the control table
      value: The value to write to the Dynamixel
    """

    if name in self.control_table:
      if 'W' in self.query(name, 'Access'):
        size = self.query(name, 'Size(Byte)')
        if size == 1:
          if self.protocol == 1:
            p1.write1ByteTxRx(port_handler, self.ID, self.query(name, 'Address'), value)
          else:
            p2.write1ByteTxRx(port_handler, self.ID, self.query(name, 'Address'), value)
        elif size == 2:
          if self.protocol == 1:
            p1.write2ByteTxRx(port_handler, self.ID, self.query(name, 'Address'), value)
          else:
            p2.write2ByteTxRx(port_handler, self.ID, self.query(name, 'Address'), value)
        elif size == 4:
          if self.protocol == 1:
            p1.write4ByteTxRx(port_handler, self.ID, self.query(name, 'Address'), value)
          else:
            p2.write4ByteTxRx(port_handler, self.ID, self.query(name, 'Address'), value)
      else:
        print('Cannot write to read-only address!')
    else:
      print('Cannot find table value!')

  def read_value(self, name):
    """
    Reads a value at the address of name

    Args:
      name: The name of the value to read
    
    Returns:
      The value at the address of name
    """

    if name in self.control_table:
      if 'R' in self.query(name, 'Access'):
        size = self.query(name, 'Size(Byte)')
        if self.protocol == 1:
          return p1.read1ByteTxRx(port_handler, self.ID, self.query(name, 'Address'))
        else:
          return p2.read1ByteTxRx(port_handler, self.ID, self.query(name, 'Address'))
      else:
        print('Cannot read at address!')
    else:
      print('Cannot find table value!')
  
  def reset_value(self, name):
    """
    Resets a value to its default

    Args:
      name: The name of the value to reset
    """

    if name in self.control_table:
      self.write_value(name, self.control_table[name]['InitialValue'])
      
  def wheel_mode(self):
    """
    Places the dynamixel in 'wheel mode', moving using speed only
    """

    self.write_value('Torque Enable', 0)
    self.write_value('CW Angle Limit', 0)
    self.write_value('CCW Angle Limit', 0)
    self.write_value('Torque Enable', 1)
    self.is_wheel = True
    self.is_joint = False

  def joint_mode(self):
    """
    Places the dynamixel in 'joint mode', moving using speed and goal position
    """

    self.write_value('Torque Enable', 0)
    self.reset_value('CW Angle Limit')
    self.reset_value('CCW Angle Limit')
    self.write_value('Torque Enable', 1)
    self.is_joint = True
    self.is_wheel = False

  def restart(self):
    """
    Resets the values of all writeable items in the control table
    """

    self.write_value('Torque Enable', 0)
    for i in self.control_table:
      self.reset_value(i)
    self.is_wheel = False
    self.is_joint = False

def initialise_dynamixel(model, ID, protocol):
  """
  Creates a Dynamixel object with a relevant control table

  Args:
    model: The model name of the servo, used to find the CSV control table
    ID: The initial ID of the Dynamixel
    protocol: The protocol used by the Dynamixel, either 1 or 2

  Returns:
    A Dynamixel class containing the control table found from the CSV, as well
    as the ID and protocol specified in its arguments
  """

  for root, dirs, files in os.walk("Driving/Servos/", topdown=False):
    for name in files:
      if os.path.splitext(name)[0] == model:
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
        return Dynamixel(os.path.splitext(name)[0], ID, protocol, control_table)
    print('Could not find matching control table!')
