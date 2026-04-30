let is_algo_on = false;
function toggle_algo() {
    set_algo(!is_algo_on);
}

// dont echo back to server
function update_algo(is_on) {
    is_algo_on = is_on;

    // change html display
    const button = document.getElementById("algo_toggle_button");
    button.className = is_algo_on ? "btn btn-to" : "btn btn-tf";
    button.innerText = is_algo_on ? "TOGGLE ALGORITHM (ON)" : "TOGGLE ALGORITHM (OFF)";
}

function set_algo(is_on) {
    // set and send to pico
    is_algo_on = is_on;
    send_ws({ type: "algo", is_algo_on: is_algo_on });

    // change html display
    const button = document.getElementById("algo_toggle_button");
    button.className = is_algo_on ? "btn btn-to" : "btn btn-tf";
    button.innerText = is_algo_on ? "TOGGLE ALGORITHM (ON)" : "TOGGLE ALGORITHM (OFF)";
}

function reset_gyro() {
    send_ws({ type: "reset_gyro" });
}

function emergency_halt() {
    send_ws({ type: "emergency_halt" });
}