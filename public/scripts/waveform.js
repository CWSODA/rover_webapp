// ── WAVEFORM ──
(function () {
    const c = document.getElementById('wave');
    function resize() { c.width = c.clientWidth || 600; c.height = 80; }
    resize(); window.addEventListener('resize', resize);
    const ctx = c.getContext('2d'); let phase = 0, seed = 0;
    function rnd() { seed = (seed * 1664525 + 1013904223) | 0; return (seed / 0x80000000) - 1; }
    function draw() {
        resize(); const w = c.width, h = c.height, mid = h / 2;
        ctx.fillStyle = 'rgba(8,19,27,0.3)'; ctx.fillRect(0, 0, w, h);
        const pts = [];
        for (let x = 0; x < w; x++) { const t = x / w; pts.push([x, mid + Math.sin(t * 12 + phase) * 14 + Math.sin(t * 31 + phase * 1.3) * 6 + Math.sin(t * 53 + phase * .7) * 3 + rnd() * 1.5]); }
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++)ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.strokeStyle = 'rgba(0,200,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++)ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.strokeStyle = 'rgba(0,200,255,0.1)'; ctx.lineWidth = 5; ctx.stroke();
        phase += 0.07; requestAnimationFrame(draw);
    }
    draw();
})();