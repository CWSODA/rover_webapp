About:
-
Poorly written NodeJS server used to interface between the PicoW on the autonomous rover. \
Includes a webapp to control the rover and view telemetry data.

Functionality:
-
- acts as a TCP client, connecting to the server on the PicoW
- serves an HTTP web page connected with websocket
- accepts control from the webpage and relays it back to the PicoW

Controls:
-
- WASD manual control
- Toggle obstacle avoidance algorithm
- Toggle "move towards heading" option for the algorithm
- Emergency halt of motors

Telemetry (live data):
- 
- LiDAR 2D plot
- Gyroscope orientation
