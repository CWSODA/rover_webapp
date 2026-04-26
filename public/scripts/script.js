/* ------------------------------------------------------ */
/*                           UI                           */
/* ------------------------------------------------------ */
function togglePanel(id) { document.getElementById(id).classList.toggle('open'); }

function set_pico_status(is_pico_connected) {
	let element = document.getElementById("pico_status");
	element.innerText = "PICO " + (is_pico_connected ? "Connected" : "Disconnected");
	element.style.color = is_pico_connected ? "#12ff55" : "#d90033";
}

/* ------------------------------------------------------ */
/*                        WebSocket                       */
/* ------------------------------------------------------ */
const ws = new WebSocket("ws://" + location.host);
let is_ws_connected = false;

ws.onopen = () => {
	console.log("WebSocket connected");
	is_ws_connected = true;
}

ws.onclose = () => {
	console.log("WebSocket disconnected");
	is_ws_connected = false;
}

// vars
let pitch = 0.0, yaw = 0.0, roll = 0.0;
ws.onmessage = (event) => {
	let data;
	try {
		data = JSON.parse(event.data);
	} catch {
		console.log("Unable to parse WebSocket JSON");
		return;
	}

	if (!Object.hasOwn(data, "type")) {
		console.error("Missing type");
		return;
	}
	switch (data.type) {
		case "rotation": {
			pitch = data.pitch;
			roll = data.roll;
			yaw = data.yaw;
			break;
		}
		case "pico_status": {
			set_pico_status(data.is_connected);
			break;
		}
		default: {
			console.log("Invalid type");
		}
	}
};

function send_ws(msg) {
	if (is_ws_connected === true) {
		ws.send(JSON.stringify(msg));
	}
}

function request_pico_status() {
	send_ws({ type: "request_pico_status" });
	setTimeout(request_pico_status, 500);
}
request_pico_status();