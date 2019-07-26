import RPi.GPIO as GPIO
import time

pin = 20

def GPIOsetup():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(pin,GPIO.OUT)

def restart():
    GPIOsetup()
    GPIO.output(pin,1)
    print("[Dynamixels]: OFF")
    time.sleep(3)
    GPIO.output(pin,0)
    print("[Dynamixels]: ON")
    return
