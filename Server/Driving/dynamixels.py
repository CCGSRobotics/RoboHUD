"""This module assists in the connection between a Python script to\
    a U2D2, which, in turn connects to Dynamixels running either protocol\
        1 or protocol 2.
Contains:
    - Code to automatically connect to a U2D2 assigned under /dev/ttyUSB
    - Code that adjusts the baudrate of the U2D2
    - A class (Dynamixel) with functions to interface with the DynamixelSDK
"""
import os
from dynamixel_sdk import PortHandler, PacketHandler

PORT_HANDLER = None

# Try to connect to the U2D2
for port in range(2):
    path = '/dev/ttyUSB{}'.format(port)
    if os.path.exists(path):
        PORT_HANDLER = PortHandler(path)
        print('Initialised U2D2 at {}'.format(path))
        break
    else:
        print('Could not initialise U2D2 at {}'.format(path))

# Could not find a USB device in range
if PORT_HANDLER is None:
    print('Could not initialise U2D2! Maybe increase port range?')
    exit()

# Protocol 1 packet handler:
PROTOCOL_ONE = PacketHandler(1.0)
# Protocol 2 packet handler:
PROTOCOL_TWO = PacketHandler(2.0)

if PORT_HANDLER.openPort():
    pass
else:
    print("Failed to open the port")

if PORT_HANDLER.setBaudRate(1000000):
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
        dynamixel_id: The initial ID of the Dynamixel
        protocol: The protocol version of the servo - either 1 or 2
        control_table: A dictionary containing the control table, formatted as
            control_table[data name] = {Address, size etc}. This is generated
            by the initialise_dynamixel function
    """

    def __init__(self, name, dynamixel_id, protocol, control_table):
        """
        Initialises the Dynamixel class with model, ID, protocol and control table
        """

        self.name = name
        self.dynamixel_id = dynamixel_id
        self.protocol = protocol
        self.control_table = control_table
        self.is_joint = True
        self.is_wheel = False

    def query(self, item, detail):
        """
        Returns the value of the row (item) and column (detail)

        Args:
            item: The row in which to look in for the information
            detail: The column in which to look in for the information

        Returns:
            The data found at row (item) and column (detail)
        """
        try:
            return self.control_table[item][detail]
        except KeyError:
            print('Could not find a matching address!')

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
                try:
                    if size == 1:
                        if self.protocol == 1:
                            PROTOCOL_ONE.write1ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                                 self.query(name, 'Address'), value)
                        else:
                            PROTOCOL_TWO.write1ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                                 self.query(name, 'Address'), value)
                    elif size == 2:
                        if self.protocol == 1:
                            PROTOCOL_ONE.write2ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                                 self.query(name, 'Address'), value)
                        else:
                            PROTOCOL_TWO.write2ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                                 self.query(name, 'Address'), value)
                    elif size == 4:
                        if self.protocol == 1:
                            PROTOCOL_ONE.write4ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                                 self.query(name, 'Address'), value)
                        else:
                            PROTOCOL_TWO.write4ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                                 self.query(name, 'Address'), value)
                except Exception as err:
                    print('An error occured when writing to Dynamixel {}'.format(self.dynamixel_id))
                    print('Make sure the U2D2 is connected properly!')
                    print('Debug info:\n', err)
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
                try:
                    if self.protocol == 1:
                        return str(PROTOCOL_ONE.read1ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                             self.query(name, 'Address'))[0])
                    return str(PROTOCOL_TWO.read1ByteTxRx(PORT_HANDLER, self.dynamixel_id,\
                            self.query(name, 'Address')))
                except Exception as err:
                    print('An error occured when reading from Dynamixel {}'\
                        .format(self.dynamixel_id))
                    print('Make sure the U2D2 is connected properly!')
                    print('Debug info:\n', err)
            else:
                print('Cannot read at address!')
        else:
            print('Cannot find table value!')
        return None

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
        for value in self.control_table:
            self.reset_value(value)
        self.is_wheel = False
        self.is_joint = False

def find_file(filename):
    """
    Finds a file in the Servos/ directory

    Args:
        filename: The name of the file to find
    """
    for root, _, files in os.walk("Servos/", topdown=False):
        for name in files:
            if os.path.splitext(name)[0] == filename:
                filepath = os.path.join(root, name)
                return filepath
    print('Could not find matching control table!')
    return None

def initialise_dynamixel(model, dynamixel_id, protocol):
    """
    Creates a Dynamixel object with a relevant control table

    Args:
        model: The model name of the servo, used to find the CSV control table
        dynamixel_id: The initial ID of the Dynamixel
        protocol: The protocol used by the Dynamixel, either 1 or 2

    Returns:
        A Dynamixel class containing the control table found from the CSV, as well
        as the ID and protocol specified in its arguments
    """

    filepath = find_file(model)
    if filepath is None:
        return Dynamixel(None, None, None, None)

    table = open(filepath, 'r').readlines()
    first_line = table[0].split(', ')
    control_table = {}
    for row in range(1, len(table)):
        line = table[row].split(', ')
        build = {}
        build[line[2]] = {}
        for iterator, item in enumerate(line):
            if line[iterator] != line[2]:
                new = item.strip()
                if new.isdigit():
                    new = int(new)
                build[line[2]][first_line[iterator].strip()] = new
        control_table = {**control_table, **build}
    return Dynamixel(model, dynamixel_id, protocol, control_table)
