"""This script is used for implementing commands defined in dynamixels.py
Contains:
    - A UDP Server class that handles requests
"""
import socketserver
import socket
import re
from dynamixels import initialise_dynamixel

SOCK = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

SERVOS = {}
REGEX = r"\((init|delete|modify|mode|read)\)"
# SERVOS[12] = initialise_dynamixel('xl320', 12, 2)

class UDPHandler(socketserver.BaseRequestHandler):
    """The UDP handler class implementing functions from dynamixels.py
    """
    def handle_regex(self, data):
        """Handles the 'special' commands encased in brackets
        Args:
            data: The data to be parsed
        """
        # Fancy regular expression to check if server is sending other commands
        # WARNING: This code is VERY experimental and will crash if
        # The wrong input is given

        items = data.split('-')
        cmd = re.match(REGEX, items[0]).group(1)
        if cmd == "init":
            model = items[1]
            dynamixel_id, protocol = map(int, items[2:])
            SERVOS[dynamixel_id] = initialise_dynamixel(model, dynamixel_id, protocol)
            SERVOS[dynamixel_id].joint_mode()
        elif cmd == "modify":
            dynamixel_id, item, value = map(str, items[1:])
            dynamixel_id = int(dynamixel_id)
            value = int(value)
            if dynamixel_id in SERVOS:
                SERVOS[dynamixel_id].write_value(item, value)
        elif cmd == "read":
            dynamixel_id, item = map(str, items[1:])
            dynamixel_id = int(dynamixel_id)
            if dynamixel_id in SERVOS:
                msg = "{}:{}:{}".format(dynamixel_id, item, SERVOS[dynamixel_id].read_value(item))
                msg = bytes(msg, 'utf-8')
                SOCK.sendto(msg, (str(self.client_address[0]), 5003))
        elif cmd == "mode":
            dynamixel_id, mode = map(str, items[1:])
            dynamixel_id = int(dynamixel_id)
            if dynamixel_id in SERVOS:
                if mode == 'wheel':
                    SERVOS[dynamixel_id].wheel_mode()
                elif mode == 'joint':
                    SERVOS[dynamixel_id].joint_mode()
        elif cmd == 'delete':
            dynamixel_id = int(items[1])
            if dynamixel_id in SERVOS:
                SERVOS.pop(dynamixel_id)
    def handle(self):
        self.data = self.request[0].decode('utf-8').strip()
        new = self.data.split('\n')
        for i in new:
            if len(re.findall(REGEX, i)) == 1:
                self.handle_regex(i)
            elif i.count('-') == 1:
                # Wheel
                dynamixel_id, speed = map(int, i.split('-'))
                if dynamixel_id in SERVOS and SERVOS[dynamixel_id].is_wheel:
                    SERVOS[dynamixel_id].write_value('Moving Speed', speed)
                elif dynamixel_id not in SERVOS:
                    print('There is no servo of dynamixel_id {} initialised!'.format(dynamixel_id))
                else:
                    print('Servo {} is not a wheel!'.format(dynamixel_id))
            elif i.count('-') == 2:
                # Joint
                dynamixel_id, pos, speed = map(int, i.split('-'))
                if dynamixel_id in SERVOS and SERVOS[dynamixel_id].is_joint:
                    SERVOS[dynamixel_id].write_value('Goal Position', pos)
                    SERVOS[dynamixel_id].write_value('Moving Speed', speed)
                elif dynamixel_id not in SERVOS:
                    print('There is no servo of dynamixel_id {} initialised!'.format(dynamixel_id))
                else:
                    print('Servo {} is not a joint!'.format(dynamixel_id))
            else:
                print('Invalid command! {}'.format(i))

socketserver.UDPServer.allow_reuse_address = True
SERVER = socketserver.UDPServer(("", 5001), UDPHandler)

print('Dynamixel Server Started!')
SERVER.serve_forever()
