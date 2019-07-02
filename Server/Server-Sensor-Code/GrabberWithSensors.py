import serial
import socketserver as SocketServer
import time
''' NOTE: EDIT THIS LINE BELOW IF THE USB PORT ADDRESS CHANGED.'''
arduino_port_address = "COM8" # Use "COM[NUMBER]"" for Windows | "/dev/ttyUSB0" for Linux/Mac

serialLine = serial.Serial(arduino_port_address, baudrate=115200, timeout=5)

numOfSensors = 2
grabberServos = [1,2,3]
cameraServos = [4,5]

def moveMicroServo(ID, Value):
    ''' Data is sent out through the Serial Communication line, using a preset format to allow the Arduino to interpret data correctly. '''
    #out = "i" + str(ID) + "v" + str(Value)
    out =str(ID) + "s" + str(Value)
    serialLine.write(bytearray(out, 'utf8'))

def readData():
    # The entire line of serial communication is read and cleaned
    line = str(serialLine.readline())
    #line = line.replace("b","")
    #line = line.replace("\\","")
    line = line[2:-5]
    
    
    
    ''' sensor_identifier is the identifer of the sensor, set in the Ardiuno's memory.
        sensor_value is the analog value read from the sensor. '''
    
    if line[0].isalpha() and line[1:].isdigit():
        # "sensor" is a dictionary that has two attributes, "value" and "identifier"
        sensor = {}
        sensor['identifier'] = line[0]
        sensor['value'] = int(line[1:])
        return sensor

    return {'identifier': 'error', 'value': 0}
    
    ''' This loop goes though each character of "string"
        and retrives the analog value from the string '''
    '''for x in range(1,len(string)):
        if string[x] != '\\':
            sensor_value = sensor_value + string[x]
        else:
            break'''
        

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

print("Arduino Communication Line established. All systems are go!")
#CODE BELOW IS TO RUN THIS CODE ON THE SERVER
class UDPServerHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        self.data = self.request[0].decode('utf-8').strip()
        if "," in self.data:
            moveCameras(self.data.split(","))
        elif "sense" in self.data:
            socket = self.request[1]
            sensor = readData()
            socket.sendto(bytes(sensor['identifier'] + str(sensor['value']) + "\n", "utf-8"), self.client_address)
        else:
            moveGrabber(int(self.data))
        



if __name__ == "main":
    HOST, PORT = "", 25565
    SocketServer.UDPServer.allow_reuse_address = True

    print("Server started!")
    server = SocketServer.UDPServer((HOST, PORT), UDPServerHandler)
    server = server.serve_forever()

####
sensor = ''
'''
while True:
    s = input('Position either camera (a,b) or grabber (a): ')
    if "," in s:
        moveCameras(s.split(','))
    

    else:

        servo_percentage_position = int(s)
    
        moveGrabber(servo_percentage_position)
    
    sensor = readData() # sensor = {'identifier': a Character, 'value': an Integer}
    print(sensor)

    # Convert to degrees C?
    if sensor['identifier'] == 't':
        sensor['value'] = round((57*(sensor['value']-20))/100,1)
'''   
