// ── RADAR ──
(function () {
    const c = document.getElementById('radar'), ctx = c.getContext('2d');
    const targets = [{ a: 0.8, r: 0.6 }, { a: 2.1, r: 0.35 }, { a: 3.9, r: 0.75 }, { a: 5.0, r: 0.5 }];
    let angle = 0;
    function draw() {
        const w = c.width, h = c.height, cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 10;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(0,200,255,0.12)'; ctx.lineWidth = 1;
        [.25, .5, .75, 1].forEach(f => { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke(); });
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        const g = ctx.createLinearGradient(0, 0, R, 0); g.addColorStop(0, 'rgba(0,200,255,0)'); g.addColorStop(1, 'rgba(0,200,255,0.2)');
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, 0, -Math.PI * .3, true); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, 0); ctx.strokeStyle = 'rgba(0,200,255,0.8)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        targets.forEach(t => {
            const diff = ((t.a - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); const alpha = diff < .3 ? .9 : Math.max(0, 1 - diff / 2.5); if (alpha < .05) return;
            const tx = cx + Math.cos(t.a) * R * t.r, ty = cy + Math.sin(t.a) * R * t.r;
            ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fillStyle = `rgba(45,255,126,${alpha})`; ctx.fill();
            if (alpha > .5) { ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.strokeStyle = `rgba(45,255,126,${alpha * .4})`; ctx.lineWidth = 1; ctx.stroke(); }
        });
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = '#00c8ff'; ctx.fill();
        angle += 0.025; requestAnimationFrame(draw);
    }
    draw();
})();