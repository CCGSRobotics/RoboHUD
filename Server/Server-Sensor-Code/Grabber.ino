#include <Servo.h> 

Servo myservo1;
Servo myservo2;
Servo myservo3;
Servo myservo4;
Servo myservo5;

int ServoID = 0;
int Value = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Com Started");
  Serial.setTimeout(5);

  myservo1.attach(9);
  myservo2.attach(10);
  myservo3.attach(11);
  myservo4.attach(5);
  myservo5.attach(6);
}

void loop() {
  
    if(Serial.available() > 0) {
        Serial.println(myservo1.read() + myservo2.read() + myservo3.read() + myservo4.read() + myservo5.read());
        
        ServoID = Serial.parseInt();
        Value = Serial.parseInt();
        Serial.println(ServoID);
        Serial.println(Value);
        if (ServoID == int(1)) {
            myservo1.write(Value);

        } else if (ServoID == int(2)) {
            myservo2.write(Value);

        } else if (ServoID == int(3)) {
            myservo3.write(Value);

        } else if (ServoID == int(4)) {
            myservo4.write(Value);

        } else if (ServoID == int(5)) {
            myservo5.write(Value);

        }
    delay(1);

        

        
    }
}
