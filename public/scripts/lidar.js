// ── 2D LIDAR ──
function deg2rad(val) { return val * 3.1415 / 180; }
(function () {
    const c = document.getElementById('lidar-canvas');
    function resize() { c.width = c.clientWidth || 640; c.height = 300; }
    resize(); window.addEventListener('resize', resize);
    const ctx = c.getContext('2d');
    // Build a static "world" of wall segments as obstacles
    const obstacles = [
        { type: 'arc', cx: 0.6, cy: 0, r: 0.18 }, { type: 'arc', cx: -0.5, cy: 0.3, r: 0.12 },
        { type: 'arc', cx: 0.1, cy: -0.55, r: 0.1 }, { type: 'arc', cx: -0.7, cy: -0.2, r: 0.15 },
        { type: 'arc', cx: 0.4, cy: 0.6, r: 0.09 }, { type: 'arc', cx: -0.2, cy: 0.7, r: 0.13 },
        { type: 'arc', cx: 0.75, cy: -0.4, r: 0.1 }, { type: 'arc', cx: -0.8, cy: 0.55, r: 0.08 },
        // bounding wall (circle at radius ~0.9)
        { type: 'wall', r: 0.92 },
    ];

    function castRay(ox, oy, angle) {
        const dx = Math.cos(angle), dy = Math.sin(angle);
        let minT = 1.0;
        obstacles.forEach(ob => {
            if (ob.type === 'arc') {
                const ex = ox - ob.cx, ey = oy - ob.cy;
                const a2 = dx * dx + dy * dy, b2 = 2 * (ex * dx + ey * dy), c2 = ex * ex + ey * ey - ob.r * ob.r;
                const disc = b2 * b2 - 4 * a2 * c2;
                if (disc < 0) return;
                const t = (-b2 - Math.sqrt(disc)) / (2 * a2);
                if (t > 0.001 && t < minT) minT = t;
            } else if (ob.type === 'wall') {
                // circle wall — ray from inside
                const ex = ox, ey = oy;
                const a2 = 1, b2 = 2 * (ex * dx + ey * dy), c2 = ex * ex + ey * ey - ob.r * ob.r;
                const disc = b2 * b2 - 4 * a2 * c2;
                if (disc < 0) return;
                const t = (-b2 + Math.sqrt(disc)) / (2 * a2);
                if (t > 0.001 && t < minT) minT = t;
            }
        });
        return minT;
    }

    function draw() {
        resize();
        // cx/cy are center coordinates
        const w = c.width, h = c.height, cx = w / 2, cy = h / 2;
        const screen_radius = Math.min(w, h) / 2 - 14;
        ctx.clearRect(0, 0, w, h);

        // background grid rings
        ctx.strokeStyle = 'rgba(255,193,7,0.08)'; ctx.lineWidth = 1;
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
        ctx.fillStyle = 'rgba(255,193,7,0.3)'; ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'center';
        ['2m', '4m', '6m', '8m'].forEach((l, i) => { ctx.fillText(l, cx, (cy - (screen_radius * (i + 1) / 4)) - 2); });

        // draw cast
        // ctx.beginPath();
        // for (let i = 0; i < lidar_data.length; i++) {
        //     const data_point = lidar_data[i]; // each point should be angle, dist
        //     const radius = data_point.dist * screen_radius / 8;
        //     const px = cx + Math.cos(data_point.angle) * radius;
        //     const py = cy + Math.sin(data_point.angle) * radius;
        //     if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        // }
        // ctx.closePath();
        // ctx.fillStyle = 'rgba(255,193,7,0.07)'; ctx.fill();
        // ctx.strokeStyle = 'rgba(255,193,7,0.5)'; ctx.lineWidth = 1; ctx.stroke();

        // Individual hit dots
        for (let i = 0; i < lidar_data.length; i++) {
            const data_point = lidar_data[i]; // each point should be angle, dist
            const radius = data_point.dist * screen_radius / 8;
            const px = cx + Math.cos(data_point.angle) * radius;
            const py = cy + Math.sin(data_point.angle) * radius;
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,193,7,0.8)'; ctx.fill();
        }

        // Center rover dot
        // ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fillStyle = 'var(--cyan)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,200,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();

        requestAnimationFrame(draw);
    }
    draw();
})();
