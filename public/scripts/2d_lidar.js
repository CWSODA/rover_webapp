// ── 2D LIDAR ──
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

    let lidarAngle = 0;
    const RAYS = 360;
    const pointCloud = new Array(RAYS).fill(1);

    function draw() {
        resize();
        const w = c.width, h = c.height, cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 14;
        ctx.clearRect(0, 0, w, h);

        // background grid rings
        ctx.strokeStyle = 'rgba(255,193,7,0.08)'; ctx.lineWidth = 1;
        [.25, .5, .75, 1].forEach(f => { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke(); });
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }

        // Range labels
        ctx.fillStyle = 'rgba(255,193,7,0.3)'; ctx.font = '8px Share Tech Mono'; ctx.textAlign = 'center';
        ['2m', '4m', '6m', '8m'].forEach((l, i) => { ctx.fillText(l, cx, (cy - (R * (i + 1) / 4)) - 2); });

        // Sweep: cast new rays around current angle
        const sweepWidth = 20;
        for (let i = 0; i < sweepWidth; i++) {
            const idx = (Math.round(lidarAngle * RAYS / (Math.PI * 2)) + i) % RAYS;
            const a = idx * (Math.PI * 2) / RAYS;
            pointCloud[idx] = castRay(0, 0, a - Math.PI / 2);
        }

        // Draw point cloud
        ctx.beginPath();
        for (let i = 0; i < RAYS; i++) {
            const a = i * (Math.PI * 2) / RAYS - Math.PI / 2;
            const d = pointCloud[i] * R;
            const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,193,7,0.07)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,193,7,0.5)'; ctx.lineWidth = 1; ctx.stroke();

        // Individual hit dots
        for (let i = 0; i < RAYS; i++) {
            const a = i * (Math.PI * 2) / RAYS - Math.PI / 2;
            const d = pointCloud[i] * R;
            const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,193,7,0.8)'; ctx.fill();
        }

        // Sweep line
        const sa = lidarAngle - Math.PI / 2;
        const sg = ctx.createLinearGradient(cx, cy, cx + Math.cos(sa) * R, cy + Math.sin(sa) * R);
        sg.addColorStop(0, 'rgba(255,193,7,0)'); sg.addColorStop(1, 'rgba(255,193,7,0.7)');
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(lidarAngle);
        const sweepG = ctx.createLinearGradient(0, 0, R, 0);
        sweepG.addColorStop(0, 'rgba(255,193,7,0)'); sweepG.addColorStop(1, 'rgba(255,193,7,0.15)');
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, 0, -Math.PI * .2, true); ctx.closePath();
        ctx.fillStyle = sweepG; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, 0); ctx.strokeStyle = 'rgba(255,193,7,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();

        // Center rover dot
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = 'var(--cyan)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,200,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();

        lidarAngle = (lidarAngle + 0.04) % (Math.PI * 2);
        requestAnimationFrame(draw);
    }
    draw();
})();