const HTTP = require("http");
const FS = require("fs");
const Path = require("path");
const NET = require("net");
const WebSocket = require("ws");
const os = require("os");

// config
const PICO_IP = '10.161.98.199';
const PICO_PORT = 4242;
TCP_TIMEOUT_MS = 3 * 1000;
const TCP_RETRY_DELAY_MS = 1000;
const SERVER_PORT = 8080;

/* ------------------------------------------------------ */
/*                     TCP CONNECTION                     */
/* ------------------------------------------------------ */
// opcodes and their lengths including start bit and opcode
const OPCODES = {
    'T': 2 + 0, // Timestamp: no data
    'L': 2 + 9, // LiDAR: sig strength(1), dist (4 as float), angle (4 as float)
    'R': 2 + 4 + 4 + 4, // Rotation Data: pitch, roll, yaw as floats
    'H': 2 + 0, // heartbeat for TCP
};
let tcp_buffer = Buffer.alloc(0);
function on_data(data) {
    tcp_buffer = Buffer.concat([tcp_buffer, data]);

    while (tcp_buffer.length > 0) {
        // find start byte '$'
        const start = tcp_buffer.indexOf('$');

        // no commands, log everything as plain text
        if (start === -1) {
            // console.log(tcp_buffer.toString());
            process.stdout.write(tcp_buffer.toString());
            buffer = Buffer.alloc(0);
            break;
        }

        // discard plaintext
        if (start !== 0) {
            let plain = tcp_buffer.subarray(0, start);
            // console.log(plain.toString());
            process.stdout.write(plain.toString());
            tcp_buffer = tcp_buffer.subarray(start, tcp_buffer.length);
        }

        // wait for opcode
        if (tcp_buffer.length < 2) break;
        const opcode = tcp_buffer[1];
        const frame_length = OPCODES[opcode];

        // check if full length has been received
        if (tcp_buffer.length < frame_length) break;

        // handle message
        const PAYLOAD_START = 2;
        switch (String.fromCharCode(opcode)) {
            case 'T': { break; } // do nothing
            case 'L': {
                const sig_str = tcp_buffer.readUInt8(PAYLOAD_START);
                const dist = tcp_buffer.readFloatLE(PAYLOAD_START + 1);
                const angle = tcp_buffer.readFloatLE(PAYLOAD_START + 1 + 4);
                break;
            }
            case 'R': {
                const pitch = tcp_buffer.readFloatLE(PAYLOAD_START);
                const roll = tcp_buffer.readFloatLE(PAYLOAD_START + 4);
                const yaw = tcp_buffer.readFloatLE(PAYLOAD_START + 4 + 4);

                send_ws({
                    type: "rotation",
                    pitch: pitch,
                    roll: roll,
                    yaw: yaw,
                });
                break;
            }
            case 'H': {
                console.log("Ping from pico");
                break;
            }
        }

        // remove frame from buffer
        if (tcp_buffer.length > frame_length) {
            tcp_buffer = tcp_buffer.subarray(frame_length, tcp_buffer.length);
        } else {
            tcp_buffer = Buffer.alloc(0);
        }
    }
}

function tcp_send(data) {
    if (is_tcp_connected === false) { return; }
    console.log("sending: " + data);

    tcp_client.write(data);
}

const net = require('net');
let is_tcp_connected = false;
let tcp_client;
function connect_to_tcp() {
    console.log("Attempting TCP connection...");
    tcp_client = net.createConnection({ host: PICO_IP, port: PICO_PORT });
    tcp_client.setNoDelay(true);

    tcp_client.on('connect', () => {
        console.log('TCP Connected');
        is_tcp_connected = true;

        tcp_client.setTimeout(TCP_TIMEOUT_MS);
        tcp_client.on('timeout', () => {
            console.log("TCP Server Timeout");
            tcp_client.destroy();
            is_tcp_connected = false;
        });
    });

    tcp_client.on('data', on_data);

    tcp_client.on('error', (err) => {
        console.log('TCP Error:', err.message);
        tcp_client.destroy(); // ensure close happens
        is_tcp_connected = false;
    });

    tcp_client.on('close', () => {
        console.log(`TCP Connection Failed. Retrying ...`);
        setTimeout(connect_to_tcp, TCP_RETRY_DELAY_MS); // retry connection after delay
    });
}
connect_to_tcp();


/* ------------------------------------------------------ */
/*                       HTTP SERVER                      */
/* ------------------------------------------------------ */
const server = HTTP.createServer((req, res) => {
    let filepath = "./public" + (req.url === "/" ? "/index.html" : req.url);

    FS.readFile(filepath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("Not found");
        } else {
            res.writeHead(200);
            res.end(content);
        }
    });
});

/* ------------------------------------------------------ */
/*                     WEBSOCKET COMMS                    */
/* ------------------------------------------------------ */
const wss = new WebSocket.Server({ server });
let ws_client = null; // only one client expected, avoids input conflicts
wss.on("connection", (ws) => {
    ws_client = ws;
    console.log("Browser connected");

    ws_client.on("message", (event) => {
        // console.log("From browser:", event.toString());
        let data;
        try {
            data = JSON.parse(event);
        } catch {
            console.log("Unable to parse WebSocket JSON");
            return;
        }

        if (!Object.hasOwn(data, "type")) {
            console.error("Missing type");
            return;
        }
        switch (data.type) {
            case "drive_ctrl": { // has bool for: fwd, back, left, right
                let dir = find_drive_dir(data);

                // send to pico
                const pico_tcp_buffer = Buffer.alloc(4);
                pico_tcp_buffer.write('$', 0, 1);
                pico_tcp_buffer.write('C', 1, 1); // C for control
                pico_tcp_buffer.writeUint8(data.speed, 2);
                pico_tcp_buffer.writeUint8(dir, 3);
                tcp_send(pico_tcp_buffer);
                break;
            }
            case "algo_toggle": { // turns on algorithm
                const pico_tcp_buffer = Buffer.alloc(2);
                pico_tcp_buffer.write('$', 0, 1);
                pico_tcp_buffer.write('A', 1, 1); // A for algo
                tcp_send(pico_tcp_buffer);
                break;
            }
            case "request_pico_status": { // request pico status
                send_pico_status(is_tcp_connected);
                break;
            }
            default: {
                console.log("Invalid type");
            }
        }
    });

    ws.on("close", () => {
        ws_client = null;
    });
});

function send_ws(msg) {
    // && client.readyState === WebSocket.OPEN
    if (ws_client !== null) {
        ws_client.send(JSON.stringify(msg));
    } else {
        console.log("No client to send to!");
    }
}


function find_drive_dir(data) {
    let dir;
    if (data.fwd && !data.back && !data.left && !data.right) {
        // 0 for N 0°
        dir = 1;
    }
    if (data.fwd && !data.back && !data.left && data.right) {
        // 1 for NE 45°
        dir = 1 << 1;
    }
    if (!data.fwd && !data.back && !data.left && data.right) {
        // 2 for E 90°
        dir = 1 << 2;
    }
    if (!data.fwd && data.back && !data.left && data.right) {
        // 3 for SE 135°
        dir = 1 << 3;
    }
    if (!data.fwd && data.back && !data.left && !data.right) {
        // 4 for S 180°
        dir = 1 << 4;
    }
    if (!data.fwd && data.back && data.left && !data.right) {
        // 5 for SW 225°
        dir = 1 << 5;
    }
    if (!data.fwd && !data.back && data.left && !data.right) {
        // 6 for W 270°
        dir = 1 << 6;
    }
    if (data.fwd && !data.back && data.left && !data.right) {
        // 7 for NW 315°
        dir = 1 << 7;
    }
    return dir;
}

function send_pico_status(is_pico_connected) {
    send_ws({ type: "pico_status", is_connected: is_pico_connected });
}

/* ------------------------------------------------------ */
/*                      START SERVER                      */
/* ------------------------------------------------------ */
const interfaces = os.networkInterfaces();
let pc_addr = '0.0.0.0';;
for (const name in interfaces) {
    for (const iface of interfaces[name]) {
        // Skip internal (localhost) and non-IPv4
        if (iface.family === 'IPv4' && !iface.internal) {
            pc_addr = iface.address;
        }
    }
}

server.listen(SERVER_PORT, '0.0.0.0', () => {
    console.log(`Server running on:`);
    console.log(`  Local:   http://localhost:${SERVER_PORT}`);
    console.log(`  Network: http://${pc_addr}:${SERVER_PORT}`);
});

