""" A module defining a function to change the state of SOCKET """

import connect
import constants

def switch(state):
    """ Invert the state of SOCKET """
    if state == constants.SWITCHON:
        connect.SOCKET.sendall(bytes("OFF\n", "utf-8"))
        return constants.SWITCHOFF

    connect.SOCKET.sendall(bytes("ON\n", "utf-8"))
    return constants.SWITCHON
