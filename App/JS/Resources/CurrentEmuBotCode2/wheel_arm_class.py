""" Complex classes representing different parts of the emubot """

import basic_classes

print("Classes setup")

class Arm(object):
    """ Represents an arn of the emubot """

    def __init__(self, identities):
        """
        Arm.__init__(identities): parses an array with the identities of the: [shoulder, tilt, pan] 
        Initialises the joints within the arm, and starts their threading
        """

        self.shoulder = basic_classes.Joint(identities[0], 200)
        self.tilt = basic_classes.Joint(identities[1], 200)
        self.pan = basic_classes.Joint(identities[2], 512)

        self.shoulder.start()
        self.tilt.start()
        self.pan.start()

    def move_shoulder(self, position=None, direction=None):
        """ Move the shoulder of the arm """
        self.shoulder.direction = direction

    def move_tilt(self, position=None, direction=None):
        """ Tilt the arm """
        self.tilt.direction = direction

    def move_pan(self, position=None, direction=None):
        """ Pan the arm """
        self.pan.direction = direction

    def move_arm_set_position(self, shoulder_pos=None, tilt_pos=None, pan_pos=None):
        """ Manually set the position of the arm """
        if shoulder_pos:
            self.shoulder.position = shoulder_pos
        if tilt_pos:
            self.tilt.position = tilt_pos
        if pan_pos:
            self.pan.position = pan_pos

    def reset(self):
        """ Revert the arm to its initial position """
        self.shoulder.position = 200
        self.tilt.position = 200
        self.pan.position = 512

        self.shoulder.move_joint(self.shoulder.position, 900)
        self.tilt.move_joint(self.tilt.position, 900)
        self.pan.move_joint(self.pan.position, 900)

    def print_angles(self):
        """ Print the position, tilt and pan of the arm """
        print('The shoulder is at position:', self.shoulder.position)
        print('The Tilt is at position:', self.tilt.position)
        print('The Pan is at position:', self.pan.position)

print('Arm Class Defined')

class Flipper(object):
    """ Represents a flipper on the emubot """

    def __init__(self, wheel_id, joint_id):
        """
        Flipper.__init__(wheel_id, joint_id): IDs of the servo that controls the flipper
        Initialises the joints within the flipper
        """

        self.joint_id = joint_id
        self.wheel = basic_classes.Wheel(wheel_id)

        self.joint_init()
        self.joint.start()

    def move_flipper(self, direction=None):
        """ Move the flipper """
        self.joint.direction = direction

    def joint_init(self):
        """ Initialise the flipper's joints """
        if self.joint_id in [5, 8]:
            self.joint = basic_classes.Joint(self.joint_id, 200)
        elif self.joint_id in [6, 7]:
            self.joint = basic_classes.Joint(self.joint_id, 800)

    def reset(self):
        """ Revert the flipper to its original position """
        self.wheel.direction = 'none'
        self.wheel.move_wheel()
        self.joint_init()

    def move_wheel(self, direction=None, speed=0):
        """ Move the wheel of the flipper """
        self.wheel.speed = speed
        self.wheel.move_wheel()

print("Flipper Class Defined")
