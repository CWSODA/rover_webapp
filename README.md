Poorly written NodeJS server used to interface between the PicoW on the autonomous rover.

Functionality:
- acts as a TCP client, connecting to the server on the PicoW
- serves an HTTP web page connected with websocket
- accepts control from the webpage and relays it back to the PicoW
