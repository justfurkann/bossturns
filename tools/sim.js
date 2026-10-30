// Denge simülasyonu: index.html içindeki oyun mantığını (DOM'suz) yükler ve
// basit insan modelleriyle binlerce tur oynatır.
// Kullanım: node tools/sim.js [tur sayısı]   (ör. node tools/sim.js 2000)
// Sabitleri denemek için: node tools/sim.js 2000 '{"warn":[0.85,0.38]}'
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadGame(overrides) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const src = html.match(/<script id="logic">([\s\S]*?)<\/script>/)[1];
  const sandbox = { module: { exports: {} }, console, Math, Date };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  const BT = sandbox.module.exports;
  if (overrides) Object.assign(BT.CONFIG, overrides);
  return BT;
}

// İnsan modeli. rt = uyarıyı görüp parmağı kaldırma süresi (sn).
const PROFILES = {
  dikkatli: { rt: [0.33, 0.07], lapse: 0.04, greed: 0.10, greedAdd: [0.15, 0.4], hold: [1.0, 3.0], wait: [0.2, 0.7] },
  ortalama: { rt: [0.40, 0.10], lapse: 0.08, greed: 0.25, greedAdd: [0.2, 0.6], hold: [1.5, 4.0], wait: [0.2, 0.9] },
  hirsli:   { rt: [0.40, 0.10], lapse: 0.08, greed: 0.50, greedAdd: [0.25, 0.8], hold: [2.5, 6.0], wait: [0.1, 0.5] },
};

function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

function makePlayer(P, r) {
  let t = 0, held = false, target = 0, releaseAt = Infinity, pressAt = -1, reactedTo = null;
  const U = ([a, b]) => a + (b - a) * r();
  return (run, dt) => {
    t += dt;
    const b = run.boss;
    if (run.state === 'pick') { held = run.pick.t > 0.8 && run.pick.chosen < 0; return held; }
    if (!held) {
      if (run.locked || b.phase !== 'away') { pressAt = -1; return false; }
      if (pressAt < 0) pressAt = t + U(P.wait);
      if (t >= pressAt) { held = true; target = U(P.hold); releaseAt = Infinity; reactedTo = null; pressAt = -1; }
      return held;
    }
    // basılı tutuyor
    if ((b.phase === 'warn' || b.phase === 'look') && reactedTo !== b.next) {
      reactedTo = b.next;
      let rt = Math.max(0.18, P.rt[0] + gauss(r) * P.rt[1]);
      if (r() < P.lapse) rt += U([0.35, 0.7]);
      if (r() < P.greed) rt += U(P.greedAdd);
      releaseAt = Math.min(releaseAt, t + rt);
    }
    if (run.holdTime >= target || t >= releaseAt || run.locked || b.phase === 'scold') held = false;
    return held;
  };
}

function simulate(BT, profile, n, seed = 1, setup = null) {
  const r = BT.makeRng('player' + seed);
  const res = { first: [], dur: [], score: [], shift: 0, presses: [] };
  for (let i = 0; i < n; i++) {
    const run = BT.createRun('free', { seed: seed * 100000 + i });
    if (setup) setup(run);
    const player = makePlayer(PROFILES[profile], r);
    const dt = 1 / 60;
    let guard = 0;
    while (run.state !== 'over' && guard++ < 60 * 600) {
      BT.updateRun(run, dt, player(run, dt));
      run.events.length = 0;
    }
    if (run.stats.firstCatchPress) res.first.push(run.stats.firstCatchPress);
    res.dur.push(run.t); res.score.push(run.score); res.presses.push(run.stats.presses);
    if (run.endReason === 'shift') res.shift++;
  }
  return res;
}

const avg = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor((s.length - 1) * q)]; };

if (require.main === module) {
  const n = Number(process.argv[2] || 1500);
  const overrides = process.argv[3] ? JSON.parse(process.argv[3]) : null;
  const BT = loadGame(overrides);
  console.log(`CONFIG.warn=${JSON.stringify(BT.CONFIG.warn)} tolerance=${BT.CONFIG.tolerance}  (${n} tur/profil)`);
  for (const p of Object.keys(PROFILES)) {
    const s = simulate(BT, p, n);
    console.log(
      `${p.padEnd(9)} ilk can: ort ${avg(s.first).toFixed(1)} basış (medyan ${pct(s.first, 0.5)}) | ` +
      `tur: ort ${avg(s.dur).toFixed(0)} sn, p90 ${pct(s.dur, 0.9).toFixed(0)} sn, max ${Math.max(...s.dur).toFixed(0)} sn | ` +
      `skor ort ${avg(s.score).toFixed(0)} | 18:00'e varan %${(100 * s.shift / n).toFixed(0)}`);
  }
}
module.exports = { loadGame, simulate, PROFILES };
