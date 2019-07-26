import serial as s
''' "serialdata" is the reading of serial data
    from the arduino,plugged in by USB '''
serialdata = s.Serial('/dev/ttyUSB0',9600)

def readPins():
    ''' "string" is the line of data read from the ardiuno. '''
    string = str(serialdata.readline()).replace("b'","")
    ''' sensor_num is the pin number the sensor is plugged into.
        sensor_value is the analog value read from the sensor. '''
    sensor_num = string[0]
    sensor_value = ''
    ''' This loop goes though each character of "string"
        and retrives the analog value from the string '''
    for x in range(1,len(string)):
        if string[x] != '\\':
            sensor_value = sensor_value + string[x]
        else:
            break
    ''' "sensor" is a dictionary that has two attributes, "value" and "num" '''
    sensor = {}
    sensor['value'] = int(sensor_value)
    sensor['num'] = int(sensor_num)
    ''' This returns the sensor dictionay so it can be used outside the function. '''
    return sensor
