
/*  5 The micro-servos have been physically labelled, from 1 to 5. 
 *  ID 1 is the camera-tilt servo, ID 2 is the camera-tilt servo.
 *  Servos 3 to 5 are the grabber servos, which operate in the same manner.
 */

#include <Servo.h> 


// ADJUST THESE VALUES SHOULD MICRO-SERVOS BE REPLACED.
// These two arrays use the format "array_name[] = [limit_for_servo_1, limit_for_servo_2, ... , limit_for_servo_5]"



// The "Servo" objects are initialised in the Arduino Nano's internal memory.

Servo grabber_servo_1;
Servo grabber_servo_2;
Servo grabber_servo_3;
Servo camera_tilt_servo;
Servo camera_rotate_servo;
 
int ServoID = 1;
int Value = 0;
long CurrentTime;
long ElapsedTime;
long PreviousTime;
bool laser = false;








// A list of references to the servo objects are created to make the code more efficient.

Servo servo_list[] = {camera_tilt_servo, camera_rotate_servo, grabber_servo_1, grabber_servo_2, grabber_servo_3};

//  NOTE: Change these values depending on what sensors are plugged into the robot & Arduino Nano.
char CO2_state = true;
char temperature_state = false;

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

// The sensor objects are then created, set-up and added to the list of sensors.
Sensor co2_sensor("CO2 Sensor", 1, CO2_state, 'c');
Sensor temperature_sensor("Temperature Sensor", 2, temperature_state, 't');

Sensor sensor_list[] = {co2_sensor, temperature_sensor};
int sensor_count = 2;

void setup() {
  // A serial communication line on a baud rate of 115200 is established. This is how data is sent and recieved from the raspberry pi.
  Serial.begin(115200);

  // The servo objects are allocated their respective pins on the arduino nano.
  // NOTE: These must be PWM-capable pins, otherwise the servo's will not work as intended.
  // A pinout guide to the Arduino Nano is available at https://i.stack.imgur.com/W9Ril.png
  
  camera_rotate_servo.attach(5);
  camera_tilt_servo.attach(6);
  grabber_servo_1.attach(9);
  grabber_servo_2.attach(10);
  grabber_servo_3.attach(11);
  
  grabber_servo_1.write(0);
  grabber_servo_2.write(0);
  grabber_servo_3.write(0);
  camera_tilt_servo.write(0);
  camera_rotate_servo.write(90);
  PreviousTime = millis();
  pinMode(3, OUTPUT);
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

    // Code below is for moving the grabber using the values input
    
    if(Serial.available() > 0) {
        //Serial.println(grabber_servo_1.read() + grabber_servo_2.read() + grabber_servo_3.read() + camera_tilt_servo.read() + camera_rotate_servo.read());
        
        ServoID = Serial.parseInt();
        Value = Serial.parseInt();
        
        //Serial.println(ServoID);
        //Serial.println(Value);
        if (ServoID == int(1)) {
            grabber_servo_1.write(Value);

        } else if (ServoID == int(2)) {
            grabber_servo_2.write(Value);

        } else if (ServoID == int(3)) {
            grabber_servo_3.write(Value);

        } else if (ServoID == int(4)) {
            camera_tilt_servo.write(Value);

        } else if (ServoID == int(5)) {
            camera_rotate_servo.write(Value);

        } else if (ServoID == int(0)) {
            if(laser == true) {
              digitalWrite(3,LOW); 
              laser = false;
              
            } else {
              digitalWrite(3,HIGH); 
              laser = true;
              
            }

              
            
        }
    }
      
    
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
      

    

    
       


    
