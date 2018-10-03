""" Initialises the input source by which the emubot is controlled """

import evdev

devices = [evdev.InputDevice(input_source) for input_source in evdev.list_devices()]

controllers = {"Logitech Gamepad F310",
               "Logitech Gamepad F710",
               "Microsoft X-Box 360 pad",
               "Logitech Logitech Cordless RumblePad 2",
               "Logitech Logitech Dual Action"}

gamepad = None
for i in devices:
    if i.name in controllers:
        gamepad = i
        break

if gamepad is None:
    raise TypeError("Variable 'gamepad' is None")

print("Gamepad is:", gamepad)
