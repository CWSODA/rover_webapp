// ── DRIVE CONTROL ──
const keysDown = new Set();
let driveHeading = 0, driveSpeed = 0, maxSpeed = 1.0, distTraveled = 0;
let lastDriveTime = Date.now();

function pressKey(k) {
    keysDown.add(k); document.getElementById('key-' + k).classList.add('pressed');
}
function releaseKey(k) {
    keysDown.delete(k); document.getElementById('key-' + k).classList.remove('pressed');
}
document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) { e.preventDefault(); pressKey(k); }
});
document.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(k)) releaseKey(k);
});

function updateSpeed(v) {
    maxSpeed = v;
    document.getElementById('speed-val').textContent = maxSpeed;

    send_ws({
        type: "speed",
        value: v,
    })
}

function driveTick() {
    const now = Date.now(); const dt = (now - lastDriveTime) / 1000; lastDriveTime = now;
    const fwd = keysDown.has('w'), back = keysDown.has('s'), left = keysDown.has('a'), right = keysDown.has('d');

    // send web socket msg
    if (fwd || back || left || right) {
        send_ws({
            type: "drive_ctrl",
            fwd: keysDown.has('w'),
            back: keysDown.has('s'),
            left: keysDown.has('a'),
            right: keysDown.has('d'),
        });
    }

    // update UI
    requestAnimationFrame(driveTick);
}
driveTick();