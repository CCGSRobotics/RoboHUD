#include <SoftwareSerial.h>

SoftwareSerial co2Serial(10, 11);
unsigned char hexdata[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
char CO2 = true;
char temperature = false;

// Reads the value of a pin, and outputs it
void readPin(int pin) {
    Serial.print(pin);
    Serial.println(analogRead(pin));
}

// Read the amount of CO2 in the surrounding air
void readCO2() {
    co2Serial.write(hexdata, 9);
    int ch;
    long high;
    long low;
    long CO2;

    for (int i = 0; i < 9; ++i)  {
        if (co2Serial.available() > 0) {
            ch = co2Serial.read();

            if (i == 2)
                high = ch;
            else if (i == 3)
                low = ch;
            else if (i == 8) {
                CO2 = high*256 + low;
                Serial.print("C ");
                Serial.println(CO2);
            }
        }
    }
}

// Setup serial communication on channel 9600
void setup() {
    Serial.begin(9600);
    co2Serial.begin(9600);
}

// The .ino equivalent of a main function
void loop() {
    if (temperature)
        readPin(1);
    if (CO2)
        readCO2();

    delay(500);
}
