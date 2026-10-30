// Tarayıcı duman testi (Playwright + Chromium, WebGL). Kullanım: node tools/smoke.js [çıktı klasörü]
// Not: Ekran kartı olmayan makinelerde WebGL yazılımla çizilir ve kareler yavaştır; bu yüzden
// beklemeler gerçek süre değil, oyunun kendi saati (view.time) üzerinden yapılır.
'use strict';
const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, '..', 'shots');
const URL = 'file://' + path.join(__dirname, '..', 'index.html');
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const wait = ms => new Promise(r => setTimeout(r, ms));

function errorsOf(page) {
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  return errs;
}
async function open(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
}
// oyunun saatiyle bekle
async function waitGame(page, sec) {
  const t0 = await page.evaluate(() => __bt.view.time);
  await page.waitForFunction(t => __bt.view.time >= t, t0 + sec, { timeout: 180000, polling: 50 });
}
// Yağmur'u sırtı dönük "dondur"
const freezeAway = page => page.evaluate(() => { const b = __bt.run.boss; b.phase = 'away'; b.t = 0; b.dur = 999; b.swap = 0; });

(async () => {
  const browser = await chromium.launch({ args: ARGS });

  /* ---------------- MASAÜSTÜ ---------------- */
  {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    const errs = errorsOf(page);
    await open(page);
    check('WebGL sahnesi açılır (hata ekranı yok)', !(await page.isVisible('#err')));
    const layout = await page.evaluate(() => ({ cls: document.getElementById('hud').className, kombin: document.getElementById('kombin').textContent }));
    check('geniş ekranda yatay yerleşim + günün kombini', layout.cls === 'wide' && /Yağmur bugün/.test(layout.kombin), layout.kombin);
    // karakter seçimi
    await page.click('#btnFree');
    await page.waitForSelector('#chars:not(.hidden) .charCard');
    const cards = await page.evaluate(() => [...document.querySelectorAll('.charCard')].map(b => ({ id: b.dataset.id, img: !!b.querySelector('img'), today: !!b.querySelector('.today') })));
    check('karakter seçimi: 4 karakter, 3D portreler, "bugünün karakteri" rozeti',
      cards.map(c => c.id).join() === 'alp,furkan,baransel,bulut' && cards.every(c => c.img) && cards.filter(c => c.today).length === 1, JSON.stringify(cards.map(c => c.id + (c.today ? '*' : ''))));
    await page.screenshot({ path: `${OUT}/smoke-chars.png` });
    await page.click('.charCard[data-id="bulut"]');
    await waitGame(page, 0.1);
    check('seçilen karakterle tur başlar (BULUT)', (await page.evaluate(() => __bt.run.charId)) === 'bulut');
    await freezeAway(page);
    const cx = 480, cy = 330;
    await page.mouse.move(cx, cy); await page.mouse.down();
    await waitGame(page, 1.5);
    const mid = await page.evaluate(() => ({ holding: __bt.run.holding, pocket: __bt.run.pocket, act: document.getElementById('action').textContent }));
    check('fare: basılı tutunca cep dolar, buton "OYNUYORSUN"', mid.holding && mid.pocket > 15 && mid.act === 'OYNUYORSUN', `cep=${mid.pocket.toFixed(1)}`);
    await page.mouse.up(); await waitGame(page, 0.1);
    const after = await page.evaluate(() => ({ score: __bt.run.score, pocket: __bt.run.pocket, holding: __bt.run.holding, kasa: document.getElementById('kasaVal').textContent }));
    check('fare: bırakınca kasaya girer', after.score > 15 && after.pocket === 0 && !after.holding, `kasa=${after.score}`);

    // boşluk tuşu
    await freezeAway(page);
    await page.keyboard.down('Space'); await waitGame(page, 0.5);
    const sp = await page.evaluate(() => __bt.run.holding);
    await page.keyboard.up('Space'); await waitGame(page, 0.1);
    check('klavye: boşluk basılı tut/bırak', sp && !(await page.evaluate(() => __bt.run.holding)));

    // uyarı: rozet + kırmızı buton
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'warn'; b.t = 0; b.dur = 999; b.next.fake = false; });
    await page.mouse.down(); await waitGame(page, 0.3);
    const w = await page.evaluate(() => ({ act: document.getElementById('action').textContent }));
    check('uyarıda "BIRAK!" butonu', w.act === 'BIRAK!');
    // bakış + yakalanma
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'look'; b.t = 0; b.dur = 5; });
    await waitGame(page, 0.3);
    const caught = await page.evaluate(() => ({ phase: __bt.run.boss.phase, lives: __bt.run.lives, locked: __bt.run.locked, hearts: document.querySelectorAll('#lives svg.lost').length }));
    check('bakarken basılı → yakalanır, can gider, kilitlenir', caught.phase === 'scold' && caught.lives === 2 && caught.locked && caught.hearts === 1, JSON.stringify(caught));
    check('yakalanınca konuşma balonu görünür', await page.isVisible('#bubble'));
    await freezeAway(page);
    await waitGame(page, 0.3);
    const lockHold = await page.evaluate(() => ({ holding: __bt.run.holding, pocket: __bt.run.pocket }));
    check('yakalandıktan sonra bırakana kadar giriş kilitli', !lockHold.holding && lockHold.pocket === 0);
    await page.mouse.up(); await waitGame(page, 0.1);
    await page.mouse.down(); await waitGame(page, 0.2);
    check('bırakıp tekrar basınca giriş açılır', await page.evaluate(() => __bt.run.holding));
    await page.mouse.up(); await waitGame(page, 0.1);

    // tolerans
    await freezeAway(page);
    await page.mouse.down(); await waitGame(page, 0.2);
    await page.evaluate(() => { const b = __bt.run.boss; b.phase = 'look'; b.t = 0; b.dur = 5; });
    await page.mouse.up(); await waitGame(page, 0.2);
    check('tolerans içinde bırakan yakalanmaz', await page.evaluate(() => __bt.run.lives === 2));

    // patron tuşu
    await page.keyboard.press('Escape'); await wait(100);
    const sheetVis = await page.isVisible('#sheet');
    const title = await page.title();
    const t1 = await page.evaluate(() => __bt.run.t); await wait(400);
    const t2 = await page.evaluate(() => __bt.run.t);
    check('Esc: sahte tablo açılır, oyun durur, sekme başlığı değişir', sheetVis && t1 === t2 && title.includes('xlsx'));
    await page.keyboard.press('Escape'); await wait(100);
    check('Esc: tablo kapanır', !(await page.isVisible('#sheet')) && !(await page.title()).includes('xlsx'));
    await page.click('#btnPanic'); await wait(80);
    const viaBtn = await page.isVisible('#sheet');
    await page.click('#sheetBack'); await wait(80);
    check('patron tuşu butonu ve ↩ çalışır', viaBtn && !(await page.isVisible('#sheet')));
    await page.mouse.move(cx, cy);

    // seçim ekranı (kahve molası)
    await page.evaluate(() => { const r = __bt.run; r.score = 260; r.pendingPick = true; r.nextBossAt = 99999; r.boss.phase = 'away'; r.boss.t = 0; r.boss.dur = 999; r.boss.swap = 0; });
    await waitGame(page, 0.1);
    const pickState = await page.evaluate(() => __bt.run.state);
    check('kahve molası ekranı açılır (3 kart)', pickState === 'pick' && (await page.locator('.card').count()) === 3);
    await waitGame(page, 0.6);
    await page.screenshot({ path: `${OUT}/smoke-pick.png` });
    await page.locator('.card').nth(1).click();
    await waitGame(page, 0.9);
    const picked = await page.evaluate(() => ({ state: __bt.run.state, mods: __bt.run.mods.slice() }));
    check('karta dokununca o kart seçilir, oyun devam eder', picked.state === 'play' && picked.mods.length === 1, JSON.stringify(picked));

    // ruh hali değişimi
    await page.evaluate(() => { const r = __bt.run; r.score = 449; r.nextBossAt = 450; r.boss.phase = 'away'; r.boss.t = 0; r.boss.dur = 999; });
    await page.mouse.down(); await waitGame(page, 0.6); await page.mouse.up(); await waitGame(page, 0.3);
    const boss = await page.evaluate(() => ({ id: __bt.run.boss.typeId, name: document.getElementById('moodName').textContent }));
    check('450 puanda Yağmur\'un ruh hali değişir, kart güncellenir', boss.id !== 'lead' && boss.name.includes('Yağmur') || boss.name === 'Patron Modu', JSON.stringify(boss));

    // tur sonu
    await page.evaluate(() => { __bt.run.t = 400; });
    await waitGame(page, 1.8);
    check('18:00 → mesai biter, özet ekranı', (await page.isVisible('#summary')) && (await page.evaluate(() => __bt.run.endReason)) === 'shift');
    await page.screenshot({ path: `${OUT}/smoke-summary.png` });
    const share = await page.textContent('#sumEmoji');
    check('özet: emoji paylaşım metni (oyuncu adıyla)', /BOSS TURNS/.test(share) && /[🟩🟨🟥🟦]/u.test(share) && /Yağmur/.test(share) && /👤 BULUT/.test(share), share.split('\n')[1] || '');
    const best = await page.evaluate(() => localStorage.getItem('bossturns.best'));
    check('en iyi skor localStorage\'a yazılır', Number(best) > 0, best);

    // can bitince
    await page.click('#btnAgain'); await waitGame(page, 0.1);
    await page.mouse.move(cx, cy);
    await page.evaluate(() => { const r = __bt.run; r.lives = 1; r.boss.phase = 'look'; r.boss.t = 0.5; r.boss.dur = 5; });
    await page.mouse.down(); await waitGame(page, 0.2); await page.mouse.up();
    await waitGame(page, 2.8);
    check('son can gidince "Eve gönderildin" özeti', (await page.isVisible('#summary')) && (await page.evaluate(() => __bt.run.endReason)) === 'fired');

    // günlük mod
    await page.click('#btnMenu'); await wait(100);
    await page.click('#btnDaily'); await waitGame(page, 0.1);
    const d1 = await page.evaluate(() => ({ mode: __bt.run.mode, seed: __bt.run.seed }));
    check('günlük mod tarih seed\'i ile başlar', d1.mode === 'daily' && d1.seed.startsWith('bossturns:20'), d1.seed);
    const dc = await page.evaluate(() => ({ got: __bt.run.charId, want: dailyCharFor(todayKey()).id }));
    check('günlük görevde herkes günün karakteriyle oynar', dc.got === dc.want, JSON.stringify(dc));

    check('masaüstü: konsol/JS hatası yok', errs.length === 0, errs.join(' | '));
    await page.close();
  }

  /* ---------------- MOBİL (dokunmatik) ---------------- */
  {
    const ctxM = await browser.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1 });
    const page = await ctxM.newPage();
    const errs = errorsOf(page);
    await open(page);
    check('dar ekranda dikey yerleşim', (await page.evaluate(() => document.getElementById('hud').className)) === 'tall');
    await page.tap('#btnFree'); await page.waitForSelector('#chars:not(.hidden) .charCard');
    await page.tap('.charCard[data-id="alp"]'); await waitGame(page, 0.1);
    await freezeAway(page);
    const cdp = await ctxM.newCDPSession(page);
    const pt = { x: 200, y: 520 };
    const touch = (type, pts = [pt]) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : pts.map((p, i) => ({ ...p, id: i })) });

    await touch('touchStart'); await waitGame(page, 1.0);
    const h = await page.evaluate(() => ({ holding: __bt.run.holding, pocket: __bt.run.pocket }));
    check('dokunmatik: uzun basma tutuş sayılır (iptal edilmez)', h.holding && h.pocket > 10, `cep=${h.pocket.toFixed(1)}`);
    check('dokunmatik: uzun basma seçim/menü açmaz', (await page.evaluate(() => String(window.getSelection()))) === '');
    await touch('touchEnd'); await waitGame(page, 0.1);
    const s1 = await page.evaluate(() => ({ score: __bt.run.score, holding: __bt.run.holding }));
    check('dokunmatik: parmağı kaldırınca kasaya girer', s1.score > 10 && !s1.holding, `kasa=${s1.score}`);

    await freezeAway(page);
    await touch('touchStart'); await waitGame(page, 0.4);
    await touch('touchCancel'); await waitGame(page, 0.1);
    check('pointercancel: tutuş biter, takılı kalmaz', !(await page.evaluate(() => __bt.run.holding)));

    const scale0 = await page.evaluate(() => window.visualViewport.scale);
    await touch('touchStart'); await touch('touchEnd'); await wait(60); await touch('touchStart'); await touch('touchEnd'); await wait(400);
    check('çift dokunma zoom yapmaz', scale0 === (await page.evaluate(() => window.visualViewport.scale)));

    await freezeAway(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...pt, id: 1 }, { x: pt.x + 60, y: pt.y, id: 2 }] });
    await waitGame(page, 0.2);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: pt.x + 60, y: pt.y, id: 2 }] });
    await waitGame(page, 0.15);
    const two = await page.evaluate(() => __bt.run.holding);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await waitGame(page, 0.1);
    check('iki parmak: biri kalkınca tutuş sürer, ikisi kalkınca biter', two && !(await page.evaluate(() => __bt.run.holding)));

    const fitP = await page.evaluate(() => { const g = document.getElementById('gl').getBoundingClientRect(), h = document.getElementById('hud').getBoundingClientRect(); return { gw: g.width, gh: g.height, hw: h.width, hh: h.height, vw: innerWidth, vh: innerHeight, sx: scrollX, sy: scrollY }; });
    check('dikey: 3D ve HUD ekranı tam kaplar, kaydırma yok', Math.abs(fitP.gw - fitP.vw) < 1 && Math.abs(fitP.hw - fitP.vw) < 1.5 && Math.abs(fitP.hh - fitP.vh) < 1.5 && fitP.sx === 0 && fitP.sy === 0, JSON.stringify(fitP));
    const vp = page.viewportSize();
    await page.setViewportSize({ width: vp.height, height: vp.width }); await waitGame(page, 0.2);
    const land = await page.evaluate(() => ({ cls: document.getElementById('hud').className, w: document.getElementById('hud').getBoundingClientRect().width, vw: innerWidth }));
    check('döndürünce yatay yerleşime geçer, HUD yeniden ölçeklenir', land.cls === 'wide' && Math.abs(land.w - land.vw) < 1.5, JSON.stringify(land));
    await page.setViewportSize(vp); await waitGame(page, 0.2);

    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    const paused = await page.evaluate(() => __bt.view.hiddenPause);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await waitGame(page, 0.05);
    check('sekme gizlenince "Duraklatıldı" ekranı', paused && (await page.isVisible('#pause')));
    await touch('touchStart'); await wait(150);
    const resumed = await page.evaluate(() => ({ p: __bt.view.hiddenPause, holding: __bt.run.holding }));
    await touch('touchEnd');
    check('dokununca devam eder (o dokunuş oynamaz)', !resumed.p && !resumed.holding);

    await page.evaluate(() => { __bt.view.hiddenPause = false; window.__btDesktopHide(); });
    check('masaüstü kancası: global patron tuşu oyunu duraklatır', await page.evaluate(() => __bt.view.hiddenPause));
    await touch('touchStart'); await touch('touchEnd'); await wait(100);

    check('mobil: konsol/JS hatası yok', errs.length === 0, errs.join(' | '));
    await ctxM.close();
  }

  /* ---------------- reduced motion ---------------- */
  {
    const ctxR = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 800, height: 450 } });
    const page = await ctxR.newPage();
    const errs = errorsOf(page);
    await open(page);
    await page.click('#btnFree'); await page.click('.charCard'); await waitGame(page, 0.1);
    await freezeAway(page);
    await page.mouse.move(400, 300); await page.mouse.down(); await waitGame(page, 0.7); await page.mouse.up(); await waitGame(page, 0.1);
    const parts = await page.evaluate(() => __bt.view.particles.filter(p => p.kind !== 'text').length);
    check('reduced-motion: parçacık patlaması yok', parts === 0);
    check('reduced-motion: hata yok', errs.length === 0, errs.join(' | '));
    await ctxR.close();
  }

  await browser.close();
  const fail = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - fail}/${results.length} geçti`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
