import serial
import socketserver as SocketServer
import time
''' NOTE: EDIT THIS LINE BELOW IF THE USB PORT ADDRESS CHANGED.'''
arduino_port_address = "COM6" # Use "COM[NUMBER]"" for Windows | "/dev/ttyUSB0" for Linux/Mac

serialLine = serial.Serial(arduino_port_address, baudrate=115200, timeout=5)

grabberServos = [1,2,3]
cameraServos = [4,5]

def moveMicroServo(ID, Value):
    ''' Data is sent out through the Serial Communication line, using a preset format to allow the Arduino to interpret data correctly. '''
    #out = "i" + str(ID) + "v" + str(Value)
    out =str(ID) + "s" + str(Value)
    serialLine.write(bytearray(out, 'utf8'))

def laserToggle(toggle):
    if toggle == "On":
        out = "9"
    elif toggle == "Off":
        out = "0"
    serialLine.write(bytearray(out, 'utf8'))
    
def moveGrabber(percentage):
    moveMicroServo(1, percentage+10)
    time.sleep(0.1)
    moveMicroServo(2, percentage+10)
    time.sleep(0.1)
    moveMicroServo(3, percentage+10)
    
def moveCameras(positions):
    moveMicroServo(4, int(positions[0]))
    time.sleep(0.1)
    moveMicroServo(5, int(positions[1])+10)
    
def moveGrabberIndv(positions):
    moveMicroServo(int(positions[0]), int(positions[1]) + 10)

        
    
    


    
print("Arduino Communication Line established. All systems are go!")

#CODE BELOW IS TO RUN THIS CODE ON THE SERVER

class UDPServerHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        self.data = self.request[0].decode('utf-8').strip()
        if "," in self.data:
            moveCameras(self.data.split(","))
        elif "i" in self.data:
            moveGrabberIndv(self.data.split("i"))
        elif "On" or "Off" in self.data:
            laserToggle(str(self.data))
        else:
            moveGrabber(int(self.data))
            
            
#if __name__ == "main":
HOST, PORT = "127.0.0.1", 25565
SocketServer.UDPServer.allow_reuse_address = True



print("Server started!")
server = SocketServer.UDPServer((HOST, PORT), UDPServerHandler)
server = server.serve_forever()


####

sensor = ''
'''
while True:
    s = input('Position either camera (a,b) or grabber (a) or an individual claw (aib) or (On or Off) to toggle laser: ')
    if "," in s:
        moveCameras(s.split(','))
    elif "On" or "Off" in s:
        laserToggle(s)
    elif "i" in s:
        moveGrabberIndv(s.split('i'))
    else:
        servo_percentage_position = int(s)
        moveGrabber(servo_percentage_position)
'''

