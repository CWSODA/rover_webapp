/* ------------------------------------------------------ */
/*                           UI                           */
/* ------------------------------------------------------ */
function togglePanel(id) { document.getElementById(id).classList.toggle('open'); }

/* ------------------------------------------------------ */
/*                        WebSocket                       */
/* ------------------------------------------------------ */
const ws = new WebSocket("ws://" + location.host);
let ws_client;

ws.onopen = () => {
	console.log("WebSocket connected");
}

ws.onclose = () => {
	console.log("WebSocket disconnected");
}

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
		default: {
			console.log("Invalid type");
		}
	}
};

function send_ws(msg) {
	ws.send(JSON.stringify(msg));
}