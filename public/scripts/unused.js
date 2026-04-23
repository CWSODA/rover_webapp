// ── CLOCK ──
function updateClock() { const n = new Date(), p = x => String(x).padStart(2, '0'); document.getElementById('clock').textContent = `${p(n.getUTCHours())}:${p(n.getUTCMinutes())}:${p(n.getUTCSeconds())} UTC`; }
setInterval(updateClock, 1000); updateClock();
let aosS = 8078;
setInterval(() => { aosS++; const p = x => String(x).padStart(2, '0'); const h = Math.floor(aosS / 3600), m = Math.floor((aosS % 3600) / 60), s = aosS % 60; document.getElementById('aos').textContent = `T+${p(h)}:${p(m)}:${p(s)}`; }, 1000);

// ── LIVE METRICS ──
setInterval(() => {
    document.getElementById('m-vel').textContent = (7.66 + (Math.random() - .5) * .06).toFixed(2);
    document.getElementById('m-alt').textContent = (347.2 + (Math.random() - .5) * .4).toFixed(1);
    document.getElementById('m-sig').textContent = Math.round(94 + (Math.random() - .5) * 5);
    document.getElementById('m-tmp').textContent = (-12.4 + (Math.random() - .5) * 1.4).toFixed(1);
    document.getElementById('pkts').textContent = Math.round(120 + (Math.random() - .5) * 40);
    document.getElementById('lat').textContent = Math.round(84 + (Math.random() - .5) * 18) + 'ms';
    [{ i: 1, v: 82, c: 'var(--cyan)' }, { i: 2, v: 76, c: 'var(--cyan)' }, { i: 3, v: 91, c: 'var(--green)' }, { i: 4, v: 34, c: 'var(--amber)' }, { i: 5, v: 58, c: 'var(--amber)' }].forEach(b => {
        const nv = Math.max(5, Math.min(99, b.v + Math.round((Math.random() - .5) * 6)));
        document.getElementById('tv' + b.i).textContent = nv + '%'; document.getElementById('tb' + b.i).style.width = nv + '%';
    });
}, 1800);

// ── EVENT LOG ──
const msgs = [
    { c: 'll-ok', s: 'PWR', m: 'Solar array A nominal — 847W output' },
    { c: '', s: 'NAV', m: 'Position fix confirmed — GPS lock' },
    { c: 'll-warn', s: 'THR', m: 'Thruster B temp elevated: 312°C' },
    { c: 'll-ok', s: 'COM', m: 'Uplink sync complete — 4.2 kbps' },
    { c: '', s: 'OBC', m: 'Telemetry batch queued — 12 frames' },
    { c: 'll-ok', s: 'ATT', m: 'Attitude stabilised — 0.02° error' },
    { c: 'll-warn', s: 'TTC', m: 'Minor packet loss detected: 0.4%' },
    { c: '', s: 'DAT', m: 'Science payload collecting — UV band' },
    { c: 'll-crit', s: 'TTC', m: 'Anomaly on Theta-4 — investigating' },
    { c: 'll-ok', s: 'PWR', m: 'Battery charge: 91% — nominal' },
];
let lc = 0;
function addLog(sys, msg, cls) {
    const t = new Date(), p = x => String(x).padStart(2, '0');
    const ts = `${p(t.getUTCHours())}:${p(t.getUTCMinutes())}:${p(t.getUTCSeconds())}`;
    const d = document.createElement('div'); d.className = 'log-line ' + (cls || '');
    d.innerHTML = `<span class="log-ts">${ts}</span><span class="log-sys">${sys}</span><span class="log-msg">${msg}</span>`;
    const el = document.getElementById('log'); el.insertBefore(d, el.firstChild);
    lc++; document.getElementById('log-count').textContent = lc + ' EVENTS';
}
setInterval(() => { const m = msgs[lc % msgs.length]; addLog(m.s, m.m, m.c); }, 2400);
msgs.slice(0, 3).forEach(m => addLog(m.s, m.m, m.c));

function cmd(name) { addLog('CMD', 'Sent: ' + name, 'll-ok'); if (!document.getElementById('p-log').classList.contains('open')) togglePanel('p-log'); }
let alertOn = false;
function emergencyHalt() {
    if (alertOn) return; alertOn = true;
    document.getElementById('alert').style.display = 'block';
    addLog('SYS', 'EMERGENCY HALT — all maneuvers suspended', 'll-crit');
    if (!document.getElementById('p-log').classList.contains('open')) togglePanel('p-log');
    setTimeout(() => { document.getElementById('alert').style.display = 'none'; alertOn = false; }, 6000);
}