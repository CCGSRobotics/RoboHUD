""" The movement client for the emubot """

import basic_classes
import constants
import controller
import wheel_arm_class

LEFT_MOVEMENT = 0
RIGHT_MOVEMENT = 0
FORWARDS_MOVEMENT = 0

LOCAL_SWITCH_ON = True
BACKWARDS_L = 1
BACKWARDS_R = 1

ARM = wheel_arm_class.Arm([5, 6, 7])
WHEEL_L1 = basic_classes.Wheel(1)
WHEEL_R2 = basic_classes.Wheel(2)
WHEEL_L3 = basic_classes.Wheel(3)
WHEEL_R4 = basic_classes.Wheel(4)

def move_left_wheels(speed):
    """ Move the wheels on the left side of the emubot """
    if speed == 0:
        WHEEL_L1.move_wheel(0)
        WHEEL_L3.move_wheel(0)
    else:
        WHEEL_L1.move_wheel(speed)
        WHEEL_L3.move_wheel(speed)

def move_right_wheels(speed):
    """ Move the wheels on the right side of the emubot """
    if speed == 0:
        WHEEL_R2.move_wheel(0)
        WHEEL_R4.move_wheel(0)
    else:
        WHEEL_R2.move_wheel(speed)
        WHEEL_R4.move_wheel(speed)

print("Event loop starting...")

for event in controller.gamepad.read_loop():
    try:
        event_code = event.code
        event_value = event.value

        if event_code != 0:
            if event_code == constants.LEFT_TRG:
                if LEFT_MOVEMENT == 3 or event_value <= 0:
                    if event_value > 0:
                        move_left_wheels(event_value * 4 * BACKWARDS_L)
                    else:
                        move_left_wheels(0)
                    LEFT_MOVEMENT = 1
                else:
                    LEFT_MOVEMENT = LEFT_MOVEMENT + 1

            elif event_code == constants.RIGHT_TRG:
                if RIGHT_MOVEMENT == 3 or event_value <= 0:
                    if event_value > 0:
                        move_right_wheels(-(event_value * 4 * BACKWARDS_R))
                    else:
                        move_right_wheels(0)
                    RIGHT_MOVEMENT = 1
                else:
                    RIGHT_MOVEMENT = RIGHT_MOVEMENT + 1

            elif event_code == constants.LB:
                if event_value == 1:
                    if BACKWARDS_L > 0:
                        BACKWARDS_L = -1
                    else:
                        BACKWARDS_L = 1

            elif event_code == constants.RB:
                if event_value == 1:
                    if BACKWARDS_R > 0:
                        BACKWARDS_R = -1
                    else:
                        BACKWARDS_R = 1

            elif event_code == constants.LHORIZ:
                if FORWARDS_MOVEMENT == 3 or event_value <= 0:
                    if event_value > 0:
                        move_left_wheels(event_value / 40)
                        move_right_wheels(event_value / 40)
                    elif event_value < 0:
                        move_left_wheels(event_value / 40)
                        move_right_wheels(event_value / 40)
                    else:
                        move_left_wheels(0)
                        move_right_wheels(0)
                    FORWARDS_MOVEMENT = 1

                else:
                    FORWARDS_MOVEMENT = FORWARDS_MOVEMENT + 1

            elif event_code == constants.LVERT:
                move_left_wheels(-(event_value / 40))
                move_right_wheels((event_value / 40))

            elif event_code == constants.D_PAD_HORIZONTAL:
                if event_value == 1:
                    ARM.move_pan(direction="increase")
                elif event_value == -1:
                    ARM.move_pan(direction="decrease")
                elif event_value == 0:
                    ARM.move_pan(direction="neutral")

            elif event_code == constants.D_PAD_VERTICAL:
                if event_value == -1:
                    ARM.move_tilt(direction="increase")
                elif event_value == 1:
                    ARM.move_tilt(direction="decrease")
                elif event_value == 0:
                    ARM.move_tilt(direction="neutral")

            elif event_code == constants.Y:
                if event_value == 1:
                    ARM.move_shoulder(direction="increase")
                elif event_value == 0:
                    ARM.move_shoulder(direction="neutral")

            elif event_code == constants.A:
                if event_value == 1:
                    ARM.move_shoulder(direction="decrease")
                elif event_value == 0:
                    ARM.move_shoulder(direction="neutral")

            elif event_code == constants.X:
                ARM.move_arm_set_position(shoulder_pos=512, tilt_pos=200, pan_pos=512)

            elif event_code == constants.B:
                if LOCAL_SWITCH_ON and event_value != 0:
                    LOCAL_SWITCH_ON = False
                    print("OFF")

                elif event_value != 0:
                    LOCAL_SWITCH_ON = True
                    print("ON")

            elif event_code == constants.START:
                # Reset all servos to original positions
                ARM.reset()
                WHEEL_L1.move_wheel(0)
                WHEEL_L3.move_wheel(0)
                WHEEL_R2.move_wheel(0)
                WHEEL_R4.move_wheel(0)

            elif event_code == constants.BACK:
                WHEEL_L1.move_wheel(0)
                WHEEL_L3.move_wheel(0)
                WHEEL_R2.move_wheel(0)
                WHEEL_R4.move_wheel(0)

            else:
                print("Unidentified Event:", event)

    except BrokenPipeError as error:
        print(error)
