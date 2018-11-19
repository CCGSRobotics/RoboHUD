import RPi.GPIO as GPIO
from time import *

def GPIOsetup():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(16,GPIO.OUT)

def SwitchON():
    GPIOsetup()
    GPIO.output(16,0)
    print("ON")
    return

def SwitchOFF():
    GPIOsetup()
    GPIO.output(16,1)
    print("OFF")
    return

def STester():
    for i in range(1000):
        SwitchON()
        sleep(0.5)
        SwitchOFF()
        sleep(0.5)

#SwitchOFF()
#STester()
