// ── 2D LIDAR ──
// changing zoom
let lidar_zoom = 4;
function update_zoom(new_zoom_val) {
    lidar_zoom = new_zoom_val;
    document.getElementById('zoom-val').innerText = lidar_zoom + 'm';
}
const c = document.getElementById('lidar-canvas');
function resize() { c.width = c.clientWidth || 640; c.height = 300; }
resize();
window.addEventListener('resize', resize);
const ctx = c.getContext('2d');

let start;
function draw(timestamp) {
    // get elasped time
    if (start === undefined) start = timestamp;
    const elapsed = timestamp - start;
    start = timestamp;

    resize();
    // cx/cy are center coordinates
    const w = c.width, h = c.height, cx = w / 2, cy = h / 2;
    const screen_radius = Math.min(w, h) / 2 - 14;
    ctx.clearRect(0, 0, w, h);

    // background grid rings
    ctx.strokeStyle = 'rgba(255,193,7,0.2)'; ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(circle_r => {
        ctx.beginPath();
        ctx.arc(cx, cy, screen_radius * circle_r, 0, Math.PI * 2);
        ctx.stroke();
    });
    for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * screen_radius, cy + Math.sin(a) * screen_radius);
        ctx.stroke();
    }

    // Range labels
    ctx.fillStyle = 'rgba(255,193,7,0.7)'; ctx.font = '10px Share Tech Mono'; ctx.textAlign = 'center';
    [0.25, 0.5, 0.75, 1].forEach((l, i) => {
        let circle_txt = (l * lidar_zoom).toFixed(2).toString();
        ctx.fillText(circle_txt, cx, (cy - (screen_radius * (i + 1) / 4)) - 2);
    });

    // Individual hit dots
    let remove_n = 0;
    for (let i = 0; i < lidar_data.length; i++) {
        const data_point = lidar_data[i]; // each point should be angle, dist
        const radius = data_point.dist * screen_radius / lidar_zoom;
        const px = cx + Math.sin(data_point.angle) * radius;
        const py = cy - Math.cos(data_point.angle) * radius;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100,255,7,1)'; ctx.fill();

        data_point.lifetime -= elapsed;
        if (data_point.lifetime < 0) remove_n += 1;
    }
    for (let x = 0; x < remove_n; x++) { // remove outdated points
        lidar_data.shift();
    }

    // Center rover circle
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,200,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();

    requestAnimationFrame(draw);
}
draw();
