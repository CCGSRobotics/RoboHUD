import serial
import socketserver as SocketServer
import time
from threading import Thread
''' NOTE: EDIT THIS LINE BELOW IF THE USB PORT ADDRESS CHANGED.'''
arduino_port_address = "/dev/ttyUSB0" # Use "COM[NUMBER]"" for Windows | "/dev/ttyUSB0" for Linux/Mac

serialLine = serial.Serial(arduino_port_address, baudrate=115200, timeout=5)

numOfSensors = 2

def readData():
    # The last line of serial communication is read 
    line = str(serialLine.readline())
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
   


def sendData():
    global sensor
    while True:
        sensor = readData()
        
Thread(target = sendData).start()
class UDPServerHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        if self != None: 
            socket = self.request[1]
            self.client_address = (self.client_address[0], 25565)
            socket.sendto(bytes(sensor['identifier'] + str(sensor['value']) + "\n", "utf-8"), self.client_address)



        

        
#if __name__ == "main":
HOST, PORT = "", 25565
SocketServer.UDPServer.allow_reuse_address = True



print("Server started!")
server = SocketServer.UDPServer((HOST, PORT), UDPServerHandler)
server = server.serve_forever()

####


sensor = ''
'''
while True:

    sensor = readData() # sensor = {'identifier': a Character, 'value': an Integer}
    print(sensor)

    # Convert to degrees C?
    if sensor['identifier'] == 't':
        sensor['value'] = round((57*(sensor['value']-20))/100,1)
'''


