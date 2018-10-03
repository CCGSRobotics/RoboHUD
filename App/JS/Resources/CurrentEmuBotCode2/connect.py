""" Establishes the connection between the input device and the emubot """

print("connect setup")
import socket

HOST, PORT = "192.168.100.1", 9999 #"169.254.44.240", 9999
SOCKET = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print("trying to establish a connection")

try:
    SOCKET.connect((HOST, PORT))
    print("connect ready")
except:
    print("""
          CONNECTION FAILED.")
          have you run the code on the raspberry pi?
          P.S. dont break the pi please
          """)

print(SOCKET)
