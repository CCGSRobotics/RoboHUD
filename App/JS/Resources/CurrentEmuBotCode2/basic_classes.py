""" Basic classes to be used by more advanced classes in wheel_arm_class.py """

import threading
import time
import connect

class Joint(threading.Thread):
    """ A Joint class representing a moving node on parts of the emubot """

    def __init__(self, identity, position):
        """ __init__(identity, position): parameters represent identification and position """
        threading.Thread.__init__(self)
        self.direction = "neutral"
        self.id = identity
        self.position = position
        self.move_joint(self.position, 900)

    def run(self):
        """ Step through a sequence of moves """
        while self.direction != "":
            if self.direction == "decrease":
                if self.position > 200:
                    self.position -= 15
            elif self.direction == "increase":
                if self.position < 800:
                    self.position += 15
            if self.direction != "neutral":
                self.move_joint(self.position, 900)
            time.sleep(0.1)

    def move_joint(self, position, speed):
        """ Move the joint """
        output = ''

        if self.id < 10:
            output += '0' + str(self.id)
        else:
            output += str(self.id)

        for _ in range(4 - len(str(position))):
            output += '0'

        output += str(position)

        for _ in range(4 - len(str(speed))):
            output += '0'

        output += str(position)

        output += '\n'
        connect.SOCKET.sendall(bytes(output, 'utf-8'))

class Wheel(object):
    """ A Wheel class representing a wheel of the emubot """

    def __init__(self, identity):
        """ Wheel.__init__(ID): parameters - the ID of the wheel """
        self.id = str(identity)
        self.direction = "none"
        self.speed = 0

    def move_wheel(self, speed):
        """ Move the wheel """
        self.speed = speed
        output = '0' + self.id

        if self.speed < 11 and self.speed > -11:
            self.speed = 0
        elif self.speed < 0:
            output += '-'
            self.speed = self.speed*-1

        for _ in range(4 - len(str(self.speed))):
            output += '0'

        output += str(self.speed)
        connect.SOCKET.sendall(bytes(output+"\n", 'utf-8'))

class Switch(object):
    """ A Switch class representing a switch on the emubot """

    def __init__(self):
        """ Switch.__init__(): initialise variables """
        self.on = True

    def change_status():
        """ Change the status of the switch """
        if self.on:
            connect.SOCKET.sendall(bytes("OFF\n", "utf-8"))
            self.on = False
        else:
            connect.SOCKET.sendall(bytes("ON\n", "utf-8"))
            self.on = True
