import serial
ser = serial.serial("COM3", baudrate=115200, timeout=5)
print(ser.readline())

def communicate(Id, Value):
    out = str(Id) + "," + str(Value)
    ser.write(bytearray(out, 'utf8'))

def moveGrabber(percentage):
    converted = percentage*160
    grabberServos = [1,2,3]
    for servo in grabberServos:
        communicate(servo, converted)


while True:
    x = input("Percentage: ")

    moveGrabber(int(x))
