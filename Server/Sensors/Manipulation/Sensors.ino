long CurrentTime;
long ElapsedTime;
long PreviousTime;

//add new sensors here and change to false or true depending on whether it is being used or not
char CO2_state = true;
char temperature_state = false;

// The sensor objects are then created, set-up and added to the list of sensors.
// Add to list if a new sensor is added, with an assigned letter
Sensor co2_sensor("CO2 Sensor", 1, CO2_state, 'c');
Sensor temperature_sensor("Temperature Sensor", 2, temperature_state, 't');

// list of sensors here
Sensor sensor_list[] = {co2_sensor, temperature_sensor};
int sensor_count = 2;


// A "Sensor" object allows the arduino to run much more effeciently.
class Sensor {
  public:
    bool state;
    char identifier;
    String Name;
    int pin; 
    // This initialise function allows the objects to be setup.
    Sensor(String n, int p, bool s, char i){
      Name = n; pin = p; state = s; identifier = i;
      }
      
};


void setup() {
  // A serial communication line on a baud rate of 115200 is established. This is how data is sent and recieved from the raspberry pi.
  Serial.begin(115200);
  PreviousTime = millis();
  // These last two lines show a debugging user the program has setup completely.
  Serial.setTimeout(5);
  
}




// The readPin procedure takes a Sensor object as input, and sends the data to the Raspberry Pi using the Serial.print commands.
void readPin(Sensor sensor) {
    Serial.print(sensor.identifier);
    Serial.println(analogRead(sensor.pin));
}

void loop() {
    // The flush() function ensures the sent data doesn't accidently interfere with the data intended for the servos.
    Serial.flush();
    
    // This "For" loop will check the state of each sensor, and if it is "True", it will send data to the Raspberry Pi using the readPin() function
    CurrentTime = millis();
    ElapsedTime = CurrentTime - PreviousTime;
    if (ElapsedTime >= 250){
      PreviousTime = CurrentTime;
      for(int i = 0; i < sensor_count; i++) 
      {
        if(sensor_list[i].state == true) 
        {
          readPin(sensor_list[i]);
        }
      }
    }
    
   
        
        
    delay(1); 
}
